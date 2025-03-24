import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useTourGuide() {
  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: '.watermark-tool-header',
          popover: {
            title: 'Welcome to Watermark Tool',
            description: 'Let\'s take a quick tour of the main features.'
          }
        },
        {
          element: '.batch-processor',
          popover: {
            title: 'Upload Images',
            description: 'Drop your images here or click to browse. You can upload multiple images at once.'
          }
        },
        {
          element: '.watermark-type-selector',
          popover: {
            title: 'Choose Watermark Type',
            description: 'Select between text or image watermark.'
          }
        },
        {
          element: '.watermark-controls',
          popover: {
            title: 'Customize Watermark',
            description: 'Adjust size, position, opacity, and other settings to perfect your watermark.'
          }
        },
        {
          element: '.preview-download',
          popover: {
            title: 'Preview and Download',
            description: 'Preview your changes in real-time and download the watermarked images when ready.'
          }
        }
      ]
    });

    // Make tour available globally
    (window as any).tourguide = driverObj;

    return () => {
      driverObj.destroy();
    };
  }, []);

  const startTour = () => {
    const tour = (window as any).tourguide;
    if (tour) {
      tour.drive();
    }
  };

  return { startTour };
}