declare module 'driver.js' {
  export interface DriveStep {
    element?: string | HTMLElement;
    popover?: {
      title?: string;
      description?: string;
      side?: 'top' | 'bottom' | 'left' | 'right';
      align?: 'start' | 'center' | 'end';
      showButtons?: boolean;
      buttons?: any[];
    };
  }

  export interface Driver {
    setSteps: (steps: DriveStep[]) => void;
    drive: () => void;
    destroy: () => void;
    moveNext?: () => void;
    movePrevious?: () => void;
  }

  export function driver(config?: any): Driver;
}
