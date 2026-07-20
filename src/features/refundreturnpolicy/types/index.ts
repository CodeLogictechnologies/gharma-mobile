export interface PolicyDescription {
  type: 'return' | 'refund'; 
  description: string;
}

export interface ReturnRefundPolicyResponse {
  type: 'success' | 'error';
  message: string;
  data: PolicyDescription[];
}