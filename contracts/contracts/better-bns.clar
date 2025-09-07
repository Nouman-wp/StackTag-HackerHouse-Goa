;; BetterBNS - Enhanced BNS with SBT integration
;; A smart contract for managing .btc domains with proof-of-work verification

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-invalid-name (err u103))
(define-constant err-unauthorized (err u104))

;; Data Variables
(define-data-var domain-price uint u2000000) ;; 2 STX in microSTX

;; Data Maps
(define-map domains 
  { name: (string-ascii 64) }
  { 
    owner: principal,
    registered-at: uint,
    expires-at: uint,
    metadata-uri: (optional (string-utf8 256))
  }
)

(define-map domain-owners
  { owner: principal }
  { domain: (string-ascii 64) }
)

(define-map name-preorders
  { name-hash: (buff 20) }
  { 
    claimer: principal,
    paid: uint,
    created-at: uint
  }
)

;; Public Functions

;; Preorder a domain name (commit-reveal scheme for fair registration)
(define-public (preorder-name (name-hash (buff 20)) (stx-burned uint))
  (let ((existing-preorder (map-get? name-preorders { name-hash: name-hash })))
    (asserts! (is-none existing-preorder) err-already-exists)
    (try! (stx-transfer? stx-burned tx-sender (as-contract tx-sender)))
    (ok (map-set name-preorders 
      { name-hash: name-hash }
      { 
        claimer: tx-sender,
        paid: stx-burned,
        created-at: block-height
      }
    ))
  )
)

;; Register a domain after preorder
(define-public (register-name (name (string-ascii 64)) (salt uint))
  (let (
    (name-hash (hash160 (concat (unwrap-panic (to-consensus-buff? name)) (unwrap-panic (to-consensus-buff? salt)))))
    (preorder (unwrap! (map-get? name-preorders { name-hash: name-hash }) err-not-found))
    (existing-domain (map-get? domains { name: name }))
  )
    (asserts! (is-none existing-domain) err-already-exists)
    (asserts! (is-eq (get claimer preorder) tx-sender) err-unauthorized)
    (asserts! (>= (get paid preorder) (var-get domain-price)) err-unauthorized)
    (asserts! (>= block-height (+ (get created-at preorder) u1)) err-unauthorized) ;; At least 1 block delay
    (asserts! (<= block-height (+ (get created-at preorder) u144)) err-unauthorized) ;; Max 144 blocks (24 hours)
    
    ;; Validate domain name
    (try! (validate-domain-name name))
    
    ;; Register the domain
    (map-set domains 
      { name: name }
      { 
        owner: tx-sender,
        registered-at: block-height,
        expires-at: (+ block-height u52560), ;; ~1 year in blocks
        metadata-uri: none
      }
    )
    
    ;; Set reverse mapping
    (map-set domain-owners
      { owner: tx-sender }
      { domain: name }
    )
    
    ;; Clean up preorder
    (map-delete name-preorders { name-hash: name-hash })
    
    (ok name)
  )
)

;; Renew domain registration
(define-public (renew-name (name (string-ascii 64)))
  (let ((domain-info (unwrap! (map-get? domains { name: name }) err-not-found)))
    (asserts! (is-eq (get owner domain-info) tx-sender) err-unauthorized)
    (try! (stx-transfer? (var-get domain-price) tx-sender (as-contract tx-sender)))
    
    (ok (map-set domains 
      { name: name }
      (merge domain-info { expires-at: (+ block-height u52560) })
    ))
  )
)

;; Transfer domain to another address
(define-public (transfer-name (name (string-ascii 64)) (new-owner principal))
  (let ((domain-info (unwrap! (map-get? domains { name: name }) err-not-found)))
    (asserts! (is-eq (get owner domain-info) tx-sender) err-unauthorized)
    (asserts! (< block-height (get expires-at domain-info)) err-unauthorized)
    
    ;; Update domain owner
    (map-set domains 
      { name: name }
      (merge domain-info { owner: new-owner })
    )
    
    ;; Update reverse mappings
    (map-delete domain-owners { owner: tx-sender })
    (map-set domain-owners
      { owner: new-owner }
      { domain: name }
    )
    
    (ok true)
  )
)

;; Update domain metadata URI
(define-public (update-metadata (name (string-ascii 64)) (metadata-uri (string-utf8 256)))
  (let ((domain-info (unwrap! (map-get? domains { name: name }) err-not-found)))
    (asserts! (is-eq (get owner domain-info) tx-sender) err-unauthorized)
    (asserts! (< block-height (get expires-at domain-info)) err-unauthorized)
    
    (ok (map-set domains 
      { name: name }
      (merge domain-info { metadata-uri: (some metadata-uri) })
    ))
  )
)

;; Admin function to update domain price
(define-public (set-domain-price (new-price uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set domain-price new-price))
  )
)

;; Read-only Functions

;; Get domain information
(define-read-only (get-domain-info (name (string-ascii 64)))
  (map-get? domains { name: name })
)

;; Get domain by owner
(define-read-only (get-domain-by-owner (owner principal))
  (map-get? domain-owners { owner: owner })
)

;; Check if domain is available
(define-read-only (is-domain-available (name (string-ascii 64)))
  (let ((domain-info (map-get? domains { name: name })))
    (match domain-info
      info (>= block-height (get expires-at info)) ;; Expired domains are available
      true ;; No registration found, available
    )
  )
)

;; Simple claim flow: pay domain-price and register if available
(define-public (claim-name (name (string-ascii 64)))
  (begin
    (try! (validate-domain-name name))
    (asserts! (is-domain-available name) err-already-exists)
    (try! (stx-transfer? (var-get domain-price) tx-sender (as-contract tx-sender)))
    (map-set domains
      { name: name }
      {
        owner: tx-sender,
        registered-at: block-height,
        expires-at: (+ block-height u52560),
        metadata-uri: none
      }
    )
    (map-set domain-owners { owner: tx-sender } { domain: name })
    (ok name)
  )
)

;; Get current domain price
(define-read-only (get-domain-price)
  (var-get domain-price)
)

;; Private Functions

;; Validate domain name format
(define-private (validate-domain-name (name (string-ascii 64)))
  (let ((name-length (len name)))
    (asserts! (>= name-length u3) err-invalid-name) ;; Minimum 3 characters
    (asserts! (<= name-length u64) err-invalid-name) ;; Maximum 64 characters
    ;; Add more validation rules as needed
    (ok true)
  )
)
