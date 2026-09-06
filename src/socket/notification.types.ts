export type NotificationType = 'order_placed' | 'order_status_updated' | 'product_created';

export interface RealtimeNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  route: string;
  entityId?: string;
  createdAt: string;
}
