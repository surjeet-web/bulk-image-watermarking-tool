import React from 'react';
import { WatermarkLayer } from '../types/watermark';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Lock, Unlock, Trash2, Eye, EyeOff, Image, Type } from 'lucide-react';

interface LayerManagerProps {
  layers: WatermarkLayer[];
  activeLayer?: string;
  onLayersChange: (layers: WatermarkLayer[]) => void;
  onActiveLayerChange: (layerId: string) => void;
}

export function LayerManager({
  layers,
  activeLayer,
  onLayersChange,
  onActiveLayerChange
}: LayerManagerProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(layers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onLayersChange(items);
  };

  const toggleLock = (layerId: string) => {
    const updatedLayers = layers.map(layer =>
      layer.id === layerId
        ? { ...layer, settings: { ...layer.settings, locked: !layer.settings.locked } }
        : layer
    );
    onLayersChange(updatedLayers);
  };

  const deleteLayer = (layerId: string) => {
    const updatedLayers = layers.filter(layer => layer.id !== layerId);
    onLayersChange(updatedLayers);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Layers</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="layers">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {layers.map((layer, index) => (
                <Draggable
                  key={layer.id}
                  draggableId={layer.id}
                  index={index}
                  isDragDisabled={layer.settings.locked}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        activeLayer === layer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => onActiveLayerChange(layer.id)}
                    >
                      <div className="flex items-center gap-2">
                        {layer.type === 'image' ? (
                          <Image className="w-4 h-4" />
                        ) : (
                          <Type className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {layer.type === 'image' ? 'Image Watermark' : 'Text Watermark'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLock(layer.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {layer.settings.locked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteLayer(layer.id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-500"
                          disabled={layer.settings.locked}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}