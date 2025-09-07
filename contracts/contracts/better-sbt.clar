;; BetterSBT - Soulbound Tokens for Proof of Work
;; Non-transferable tokens representing achievements and credentials

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-not-found (err u201))
(define-constant err-already-exists (err u202))
(define-constant err-unauthorized (err u203))
(define-constant err-sbt-not-transferable (err u204))

;; Data Variables
(define-data-var next-sbt-id uint u1)

;; Data Maps
(define-map sbts
  { sbt-id: uint }
  {
    recipient: principal,
    issuer: principal,
    issued-at: uint,
    metadata-uri: (string-utf8 256),
    category: (string-ascii 32),
    verified: bool
  }
)

(define-map user-sbts
  { user: principal }
  { sbt-ids: (list 100 uint) }
)

(define-map issuer-sbts
  { issuer: principal }
  { sbt-ids: (list 1000 uint) }
)

(define-map authorized-issuers
  { issuer: principal }
  { authorized: bool }
)

;; SBT Categories
(define-map sbt-categories
  { category: (string-ascii 32) }
  { 
    name: (string-utf8 64),
    description: (string-utf8 256),
    active: bool
  }
)

;; Public Functions

;; Issue a new SBT
(define-public (issue-sbt 
    (recipient principal) 
    (metadata-uri (string-utf8 256)) 
    (category (string-ascii 32)))
  (let (
    (sbt-id (var-get next-sbt-id))
    (existing-sbt (map-get? sbts { sbt-id: sbt-id }))
    (user-sbt-list (default-to (list) (get sbt-ids (map-get? user-sbts { user: recipient }))))
    (issuer-sbt-list (default-to (list) (get sbt-ids (map-get? issuer-sbts { issuer: tx-sender }))))
  )
    ;; Check if issuer is authorized (contract owner or authorized issuer)
    (asserts! (or (is-eq tx-sender contract-owner) 
                  (default-to false (get authorized (map-get? authorized-issuers { issuer: tx-sender }))))
              err-unauthorized)
    
    ;; Check if category exists and is active
    (asserts! (default-to false (get active (map-get? sbt-categories { category: category }))) 
              err-not-found)
    
    ;; Create the SBT
    (map-set sbts
      { sbt-id: sbt-id }
      {
        recipient: recipient,
        issuer: tx-sender,
        issued-at: block-height,
        metadata-uri: metadata-uri,
        category: category,
        verified: true
      }
    )
    
    ;; Update user's SBT list
    (map-set user-sbts
      { user: recipient }
      { sbt-ids: (unwrap-panic (as-max-len? (append user-sbt-list sbt-id) u100)) }
    )
    
    ;; Update issuer's SBT list
    (map-set issuer-sbts
      { issuer: tx-sender }
      { sbt-ids: (unwrap-panic (as-max-len? (append issuer-sbt-list sbt-id) u1000)) }
    )
    
    ;; Increment next SBT ID
    (var-set next-sbt-id (+ sbt-id u1))
    
    (ok sbt-id)
  )
)

;; Revoke an SBT (only by issuer or contract owner)
(define-public (revoke-sbt (sbt-id uint))
  (let ((sbt-info (unwrap! (map-get? sbts { sbt-id: sbt-id }) err-not-found)))
    (asserts! (or (is-eq tx-sender (get issuer sbt-info)) 
                  (is-eq tx-sender contract-owner)) 
              err-unauthorized)
    
    ;; Mark as unverified instead of deleting (for audit trail)
    (ok (map-set sbts
      { sbt-id: sbt-id }
      (merge sbt-info { verified: false })
    ))
  )
)

;; Add a new SBT category
(define-public (add-category 
    (category (string-ascii 32)) 
    (name (string-utf8 64)) 
    (description (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (is-none (map-get? sbt-categories { category: category })) err-already-exists)
    
    (ok (map-set sbt-categories
      { category: category }
      {
        name: name,
        description: description,
        active: true
      }
    ))
  )
)

;; Toggle category status
(define-public (toggle-category (category (string-ascii 32)))
  (let ((category-info (unwrap! (map-get? sbt-categories { category: category }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    
    (ok (map-set sbt-categories
      { category: category }
      (merge category-info { active: (not (get active category-info)) })
    ))
  )
)

;; Authorize an issuer
(define-public (authorize-issuer (issuer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set authorized-issuers
      { issuer: issuer }
      { authorized: true }
    ))
  )
)

;; Revoke issuer authorization
(define-public (revoke-issuer (issuer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set authorized-issuers
      { issuer: issuer }
      { authorized: false }
    ))
  )
)

;; Read-only Functions

;; Get SBT information
(define-read-only (get-sbt (sbt-id uint))
  (map-get? sbts { sbt-id: sbt-id })
)

;; Get user's SBTs
(define-read-only (get-user-sbts (user principal))
  (map-get? user-sbts { user: user })
)

;; Get issuer's SBTs
(define-read-only (get-issuer-sbts (issuer principal))
  (map-get? issuer-sbts { issuer: issuer })
)

;; Get SBT category information
(define-read-only (get-category (category (string-ascii 32)))
  (map-get? sbt-categories { category: category })
)

;; Check if issuer is authorized
(define-read-only (is-authorized-issuer (issuer principal))
  (default-to false (get authorized (map-get? authorized-issuers { issuer: issuer })))
)

;; Get next SBT ID
(define-read-only (get-next-sbt-id)
  (var-get next-sbt-id)
)

;; Verify SBT authenticity
(define-read-only (verify-sbt (sbt-id uint))
  (match (map-get? sbts { sbt-id: sbt-id })
    sbt-info (and (get verified sbt-info) 
                  (or (is-authorized-issuer (get issuer sbt-info))
                      (is-eq (get issuer sbt-info) contract-owner)))
    false
  )
)
