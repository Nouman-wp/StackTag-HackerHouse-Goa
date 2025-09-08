;; Simple SBT Contract for Stack Tag
;; Simplified version for reliable deployment

;; Define the SBT NFT
(define-non-fungible-token sbt-token uint)

;; Data maps
(define-map sbt-data uint {
  name: (string-ascii 64),
  description: (string-ascii 256),
  image: (string-ascii 256),
  issuer: (string-ascii 64),
  recipient: principal
})

(define-map user-sbt-count principal uint)
(define-data-var next-sbt-id uint u1)

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant CONTRACT-OWNER tx-sender)

;; Get next SBT ID
(define-read-only (get-next-sbt-id)
  (var-get next-sbt-id)
)

;; Get SBT data
(define-read-only (get-sbt-data (sbt-id uint))
  (map-get? sbt-data sbt-id)
)

;; Get user's SBT count
(define-read-only (get-user-sbt-count (user principal))
  (default-to u0 (map-get? user-sbt-count user))
)

;; Get SBT owner
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
    
    ;; Store data
    (map-set sbt-data sbt-id {
      name: name,
      description: description,
      image: image,
      issuer: issuer,
      recipient: recipient
    })
    
    ;; Update user's SBT count
    (map-set user-sbt-count recipient (+ current-count u1))
    
    ;; Increment next ID
    (var-set next-sbt-id (+ sbt-id u1))
    
    (ok sbt-id)
  )
)

;; Transfer SBT
(define-public (transfer-sbt (sbt-id uint) (sender principal) (recipient principal))
  (begin
    ;; Check ownership
    (asserts! (is-eq (some sender) (nft-get-owner? sbt-token sbt-id)) ERR-NOT-AUTHORIZED)
    
    ;; Transfer the NFT
    (try! (nft-transfer? sbt-token sbt-id sender recipient))
    
    ;; Update data
    (match (map-get? sbt-data sbt-id)
      existing-data
      (map-set sbt-data sbt-id 
        (merge existing-data { recipient: recipient }))
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

;; Contract owner check
(define-read-only (is-contract-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)
