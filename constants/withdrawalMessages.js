/**
 * System messages for the Withdrawal feature.
 * Use these across Profile, withdrawal screens, and API responses.
 *
 * 1. MIN_BALANCE_REQUIRED – withdraw button disabled (balance < ₹10)
 * 2. INVALID_AMOUNT – amount validation (withdrawal form)
 * 3. REQUEST_RAISED – success when user submits withdrawal request
 * 4. SUCCESS_PROCESSED – after admin approves (show when withdrawal status = approved)
 * 5. FAILED_REJECTED – when admin rejects (show when withdrawal status = rejected)
 * 6. INVALID_MOBILE – 10-digit mobile validation
 * 7. INVALID_CARD – card details validation
 */
export const WITHDRAWAL_MESSAGES = {
  MIN_BALANCE_REQUIRED: 'Minimum balance of ₹10 is required to enable withdrawal.',
  INVALID_AMOUNT: 'Please enter an amount greater than ₹10 and less than or equal to your available balance.',
  REQUEST_RAISED: 'Your withdrawal request has been raised successfully and is pending approval.',
  SUCCESS_PROCESSED: 'Your withdrawal has been successfully processed. The amount has been deducted from your wallet.',
  FAILED_REJECTED: 'Your withdrawal request has failed. The amount has been re-added to your wallet.',
  INVALID_MOBILE: 'Please enter a valid 10-digit mobile number.',
  INVALID_CARD: 'Please enter valid card details to proceed with the withdrawal.',
};
