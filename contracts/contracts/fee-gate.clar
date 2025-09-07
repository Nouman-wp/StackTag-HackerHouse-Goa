;; Minimal fee-gate contract: requires 20 STX payment to proceed
;; Recipient: ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC

(define-constant domain-fee u20000000) ;; 20 STX (in microSTX)
(define-constant fee-recipient 'ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC)

;; Pay-only entrypoint. No args, no storage.
(define-public (pay-fee)
  (begin
    (try! (stx-transfer? domain-fee tx-sender fee-recipient))
    (ok true)
  )
)

;; Helpers
(define-read-only (get-fee)
  domain-fee
)

(define-read-only (get-recipient)
  fee-recipient
)


