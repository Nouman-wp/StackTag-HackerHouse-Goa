;; Simple BNS Contract - 20 STX fee to specific address
;; Target address: ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC

(define-constant err-already-exists (err u100))
(define-constant err-invalid-name (err u101))
(define-constant err-payment-failed (err u102))

;; Fixed fee and recipient
(define-constant domain-fee u20000000) ;; 20 STX in microSTX
(define-constant fee-recipient 'ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC)

;; Domain registry
(define-map domains 
  { name: (string-ascii 64) }
  { owner: principal, registered-at: uint, tx-id: (buff 32) }
)

;; Owner to domain mapping
(define-map domain-owners
  { owner: principal }
  { domain: (string-ascii 64) }
)

;; Validate domain name
(define-private (validate-domain-name (name (string-ascii 64)))
  (let ((len (len name)))
    (asserts! (>= len u3) err-invalid-name)
    (asserts! (<= len u32) err-invalid-name)
    (ok true)
  )
)

;; Check if domain is available
(define-read-only (is-domain-available (name (string-ascii 64)))
  (is-none (map-get? domains { name: name }))
)

;; Get domain info
(define-read-only (get-domain-info (name (string-ascii 64)))
  (map-get? domains { name: name })
)

;; Get domain by owner
(define-read-only (get-domain-by-owner (owner principal))
  (map-get? domain-owners { owner: owner })
)

;; Get domain fee
(define-read-only (get-domain-fee)
  domain-fee
)

;; Main function: Claim domain with 20 STX payment
(define-public (claim-domain (name (string-ascii 64)))
  (begin
    ;; Validate domain name
    (try! (validate-domain-name name))
    
    ;; Check if domain is available
    (asserts! (is-domain-available name) err-already-exists)
    
    ;; Transfer 20 STX to fee recipient
    (try! (stx-transfer? domain-fee tx-sender fee-recipient))
    
    ;; Register domain
    (map-set domains
      { name: name }
      { 
        owner: tx-sender, 
        registered-at: block-height,
        tx-id: (unwrap-panic (get-tx-id))
      }
    )
    
    ;; Set owner mapping
    (map-set domain-owners { owner: tx-sender } { domain: name })
    
    (ok name)
  )
)

;; Helper to get transaction ID (simplified)
(define-private (get-tx-id)
  (ok 0x0000000000000000000000000000000000000000000000000000000000000000)
)
