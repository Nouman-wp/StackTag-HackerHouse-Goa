;; Simple SBT Transfer Contract
;; Allows users to mint and transfer SBTs with metadata stored on IPFS

;; Define the SBT NFT
(define-non-fungible-token sbt-token uint)

;; Data maps
(define-map sbt-metadata uint {
  name: (string-ascii 64),
  description: (string-ascii 256),
  image: (string-ascii 256),
  issuer: (string-ascii 64),
  recipient: principal,
  issued-at: uint
})

(define-map user-sbt-count principal uint)
(define-data-var next-sbt-id uint u1)

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-EXISTS (err u409))

;; Get next SBT ID
(define-read-only (get-next-sbt-id)
  (var-get next-sbt-id)
)

;; Get SBT metadata
(define-read-only (get-sbt-metadata (sbt-id uint))
  (map-get? sbt-metadata sbt-id)
)

;; Get user's SBT count
(define-read-only (get-user-sbt-count (user principal))
  (default-to u0 (map-get? user-sbt-count user))
)

;; Check if user owns SBT
(define-read-only (get-sbt-owner (sbt-id uint))
  (nft-get-owner? sbt-token sbt-id)
)

;; Mint SBT to recipient
(define-public (mint-sbt 
  (recipient principal) 
  (name (string-ascii 64)) 
  (description (string-ascii 256)) 
  (image (string-ascii 256)) 
  (issuer (string-ascii 64)))
  (let 
    (
      (sbt-id (var-get next-sbt-id))
      (current-count (get-user-sbt-count recipient))
    )
    ;; Mint the NFT
    (try! (nft-mint? sbt-token sbt-id recipient))
    
    ;; Store metadata
    (map-set sbt-metadata sbt-id {
      name: name,
      description: description,
      image: image,
      issuer: issuer,
      recipient: recipient,
      issued-at: block-height
    })
    
    ;; Update user's SBT count
    (map-set user-sbt-count recipient (+ current-count u1))
    
    ;; Increment next ID
    (var-set next-sbt-id (+ sbt-id u1))
    
    (ok sbt-id)
  )
)

;; Transfer SBT (for admin/issuer use)
(define-public (transfer-sbt (sbt-id uint) (sender principal) (recipient principal))
  (begin
    ;; Check if sender owns the SBT or is the contract caller
    (asserts! (or (is-eq (some sender) (nft-get-owner? sbt-token sbt-id)) 
                  (is-eq tx-sender sender)) ERR-NOT-AUTHORIZED)
    
    ;; Transfer the NFT
    (try! (nft-transfer? sbt-token sbt-id sender recipient))
    
    ;; Update recipient in metadata
    (match (map-get? sbt-metadata sbt-id)
      existing-metadata
      (map-set sbt-metadata sbt-id 
        (merge existing-metadata { recipient: recipient }))
      false)
    
    ;; Update counts
    (let 
      (
        (sender-count (get-user-sbt-count sender))
        (recipient-count (get-user-sbt-count recipient))
      )
      (map-set user-sbt-count sender (- sender-count u1))
      (map-set user-sbt-count recipient (+ recipient-count u1))
    )
    
    (ok true)
  )
)

;; Batch mint SBTs (for efficient multiple minting)
(define-public (batch-mint-sbts 
  (recipients (list 10 principal))
  (names (list 10 (string-ascii 64)))
  (descriptions (list 10 (string-ascii 256)))
  (images (list 10 (string-ascii 256)))
  (issuers (list 10 (string-ascii 64))))
  (let 
    (
      (start-id (var-get next-sbt-id))
    )
    ;; Use fold to mint each SBT
    (fold batch-mint-helper 
      (zip recipients (zip names (zip descriptions (zip images issuers))))
      (ok start-id))
  )
)

;; Helper function for batch minting
(define-private (batch-mint-helper 
  (params { recipient: principal, names: (string-ascii 64), descriptions: (string-ascii 256), images: (string-ascii 256), issuers: (string-ascii 64) })
  (prev-result (response uint uint)))
  (match prev-result
    success-val
    (mint-sbt 
      (get recipient params)
      (get names params)
      (get descriptions params)
      (get images params)
      (get issuers params))
    error-val
    (err error-val))
)

;; Get all SBTs for a user (returns list of IDs)
(define-read-only (get-user-sbts (user principal))
  (let 
    (
      (count (get-user-sbt-count user))
      (max-id (var-get next-sbt-id))
    )
    (filter-user-sbts user u1 max-id (list))
  )
)

;; Helper to filter SBTs belonging to user
(define-private (filter-user-sbts (user principal) (current-id uint) (max-id uint) (acc (list 100 uint)))
  (if (> current-id max-id)
    acc
    (match (nft-get-owner? sbt-token current-id)
      owner
      (if (is-eq owner user)
        (filter-user-sbts user (+ current-id u1) max-id (unwrap-panic (as-max-len? (append acc current-id) u100)))
        (filter-user-sbts user (+ current-id u1) max-id acc))
      (filter-user-sbts user (+ current-id u1) max-id acc)))
)

;; Admin functions
(define-constant CONTRACT-OWNER tx-sender)

(define-read-only (is-contract-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)

;; Emergency functions (only contract owner)
(define-public (emergency-transfer (sbt-id uint) (new-owner principal))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (match (nft-get-owner? sbt-token sbt-id)
      current-owner
      (transfer-sbt sbt-id current-owner new-owner)
      ERR-NOT-FOUND)
  )
)
