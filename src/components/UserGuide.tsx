import React from 'react';
import {
  ImageUp,
  Type,
  Sliders,
  Grid,
  Download,
  Move,
  ZoomIn,
  Eye,
  Palette,
  Layout,
  Save,
  Settings,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  instructions: string[];
  tips: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedFeatures: string[];
  image?: string;
}

export function UserGuide() {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const guides: GuideSection[] = [
    {
      id: 'image-upload',
      title: 'Image Upload',
      description: 'Upload single or multiple images for watermarking. Supports drag-and-drop functionality and file selection.',
      benefits: [
        'Batch processing of multiple images',
        'Drag-and-drop support for easy uploading',
        'Preview thumbnails of uploaded images',
        'Automatic image optimization'
      ],
      instructions: [
        'Drag and drop images onto the upload area',
        'Or click the upload area to select files',
        'View thumbnails of uploaded images below',
        'Remove unwanted images by clicking the X button'
      ],
      tips: [
        'Use high-resolution images for best results',
        'Supported formats: JPG, PNG, WEBP',
        'Maximum file size: 10MB per image',
        'Upload similar sized images together for consistent watermarking'
      ],
      faqs: [
        {
          question: 'What image formats are supported?',
          answer: 'The tool supports JPG, PNG, and WEBP formats.'
        },
        {
          question: 'Is there a limit to how many images I can upload?',
          answer: 'There is no strict limit on the number of images, but we recommend processing batches of 50 or fewer for optimal performance.'
        }
      ],
      relatedFeatures: ['Image Preview', 'Batch Processing'],
      image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'watermark-types',
      title: 'Watermark Types',
      description: 'Choose between text-based or image-based watermarks with extensive customization options.',
      benefits: [
        'Flexibility in watermark style',
        'Text watermarks with custom fonts',
        'Image watermarks with transparency',
        'Multiple watermark patterns'
      ],
      instructions: [
        'Select text or image watermark type',
        'For text: Enter text and customize font settings',
        'For image: Upload watermark image and adjust settings',
        'Preview changes in real-time'
      ],
      tips: [
        'Use transparent PNG files for image watermarks',
        'Keep text watermarks simple and legible',
        'Test different fonts for best visibility',
        'Consider the contrast with your images'
      ],
      faqs: [
        {
          question: 'Can I use custom fonts?',
          answer: 'Yes, you can upload custom fonts or choose from our selection of Google Fonts.'
        },
        {
          question: 'What\'s the ideal watermark image format?',
          answer: 'PNG format with transparency is recommended for best results.'
        }
      ],
      relatedFeatures: ['Font Selection', 'Pattern Options'],
      image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'positioning',
      title: 'Watermark Positioning',
      description: 'Precise control over watermark placement with drag-and-drop positioning and preset locations.',
      benefits: [
        'Drag-and-drop positioning',
        'Preset position options',
        'Grid snapping for alignment',
        'Custom position memory'
      ],
      instructions: [
        'Choose a preset position or enable custom positioning',
        'Drag the watermark to desired location',
        'Use arrow keys for fine-tuning',
        'Adjust margin from edges'
      ],
      tips: [
        'Use grid snapping for precise alignment',
        'Consider image content when positioning',
        'Save frequently used positions as presets',
        'Test visibility in different positions'
      ],
      faqs: [
        {
          question: 'Can I save custom positions?',
          answer: 'Yes, you can save custom positions as presets for future use.'
        },
        {
          question: 'How do I make fine adjustments?',
          answer: 'Use arrow keys or the position sliders for precise control.'
        }
      ],
      relatedFeatures: ['Grid System', 'Position Presets'],
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'patterns',
      title: 'Watermark Patterns',
      description: 'Create complex watermark patterns with various layout options and spacing controls.',
      benefits: [
        'Multiple pattern types',
        'Customizable spacing and rotation',
        'Automatic distribution',
        'Pattern preview'
      ],
      instructions: [
        'Select a pattern type (Grid, Diagonal, Wave, etc.)',
        'Adjust pattern spacing and quantity',
        'Set rotation angle if desired',
        'Preview and adjust until satisfied'
      ],
      tips: [
        'Start with fewer watermarks and increase as needed',
        'Use different patterns for different image types',
        'Consider image content when choosing patterns',
        'Test pattern visibility on various backgrounds'
      ],
      faqs: [
        {
          question: 'What pattern types are available?',
          answer: 'Available patterns include Single, Grid, Diagonal, Wave, Circular, and Random.'
        },
        {
          question: 'Can I customize pattern spacing?',
          answer: 'Yes, you can adjust both horizontal and vertical spacing for patterns.'
        }
      ],
      relatedFeatures: ['Rotation Control', 'Spacing Adjustment'],
      image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'effects',
      title: 'Visual Effects',
      description: 'Enhance watermarks with various visual effects including shadows, strokes, and blend modes.',
      benefits: [
        'Professional-looking watermarks',
        'Improved visibility options',
        'Creative styling possibilities',
        'Real-time preview'
      ],
      instructions: [
        'Select desired effects from the Effects panel',
        'Adjust effect parameters',
        'Preview changes in real-time',
        'Combine multiple effects as needed'
      ],
      tips: [
        'Use shadows for better contrast',
        'Experiment with blend modes',
        'Keep effects subtle for professional look',
        'Test visibility on different backgrounds'
      ],
      faqs: [
        {
          question: 'What effects are available?',
          answer: 'Available effects include shadows, strokes, glow, blur, and various blend modes.'
        },
        {
          question: 'Can I combine multiple effects?',
          answer: 'Yes, you can combine multiple effects to create unique watermark styles.'
        }
      ],
      relatedFeatures: ['Blend Modes', 'Opacity Control'],
      image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'export',
      title: 'Export Options',
      description: 'Export watermarked images individually or in batch with various format options.',
      benefits: [
        'Batch export support',
        'Multiple format options',
        'Quality control',
        'Automatic file naming'
      ],
      instructions: [
        'Select desired export format',
        'Choose quality settings',
        'Click export button',
        'Select destination for saved files'
      ],
      tips: [
        'Use appropriate quality settings',
        'Consider file size requirements',
        'Export in batches for efficiency',
        'Test exported files before bulk processing'
      ],
      faqs: [
        {
          question: 'What export formats are supported?',
          answer: 'Images can be exported as PNG files, maintaining the highest quality.'
        },
        {
          question: 'How are exported files named?',
          answer: 'Files are automatically named with a "watermarked_" prefix followed by the original filename.'
        }
      ],
      relatedFeatures: ['Batch Processing', 'Preview'],
      image: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=800&auto=format&fit=crop&q=60'
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Watermark Tool Guide</h1>
        <p className="text-lg text-gray-600">
          Learn how to use all features of our powerful watermarking tool
        </p>
      </div>

      <div className="space-y-6">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="border rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <button
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection(guide.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold">{guide.title}</span>
              </div>
              {expandedSection === guide.id ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            {expandedSection === guide.id && (
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-gray-600">{guide.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {guide.benefits.map((benefit, index) => (
                          <li key={index} className="text-gray-600">{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">How to Use</h3>
                      <ol className="list-decimal pl-5 space-y-1">
                        {guide.instructions.map((instruction, index) => (
                          <li key={index} className="text-gray-600">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {guide.image && (
                      <img
                        src={guide.image}
                        alt={guide.title}
                        className="rounded-lg shadow-md w-full"
                      />
                    )}

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Tips</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {guide.tips.map((tip, index) => (
                          <li key={index} className="text-gray-600">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">FAQs</h3>
                      <div className="space-y-4">
                        {guide.faqs.map((faq, index) => (
                          <div key={index}>
                            <p className="font-medium text-gray-900">{faq.question}</p>
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Related Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {guide.relatedFeatures.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}