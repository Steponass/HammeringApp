export interface NotificationData {
  id: string;
  message: string;
  isRemoving?: boolean;
  variant?: NotificationVariant;
}

export type NotificationVariant = 'hammer' | 'completion';

export interface NotificationConfig {
  position: 'bottom-center' | 'center';
  autoRemove: boolean;
  removeDelay: number;
  variant: NotificationVariant;
}