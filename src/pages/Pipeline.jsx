import { useState } from 'react';
import { useData } from '../context/DataContext';

const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export default function Pipeline() {
  const { leads, updateLead } = useData();
  const [draggedLead, setDraggedLead] = useState(null);

  // Group leads by status, mapping standard status to pipeline stages if needed
  const pipelineData = stages.reduce((acc, stage) => {
    acc[stage] = leads.filter(l => (l.status === stage || (stage === 'New' && !stages.includes(l.status))));
    return acc;
  }, {});

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== targetStage) {
      updateLead(draggedLead.id, { ...draggedLead, status: targetStage });
    }
    setDraggedLead(null);
  };

const stageColors = {
  'New': 'bg-blue-50 text-blue-500',
  'Contacted': 'bg-purple-50 text-purple-500',
  'Qualified': 'bg-orange-50 text-orange-500',
  'Proposal': 'bg-pink-50 text-pink-500',
  'Negotiation': 'bg-indigo-50 text-indigo-500',
  'Won': 'bg-green-50 text-green-500',
  'Lost': 'bg-gray-100 text-gray-500'
};

  return (
    <div className="h-[calc(100vh-8rem)] overflow-x-auto pb-4">
      <div className="flex gap-4 h-full min-w-max p-1">
        {stages.map(stage => (
          <div 
            key={stage} 
            className="w-80 flex flex-col bg-gray-50 rounded-2xl border border-gray-200 flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="p-4 border-b border-gray-200 bg-gray-100/50 rounded-t-2xl flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">{stage}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${stageColors[stage]}`}>
                {pipelineData[stage].length}
              </span>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {pipelineData[stage].map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">{lead.contactPerson || lead.name}</h4>
                    <span className="text-xs font-medium bg-green-50 text-green-600 px-2 py-0.5 rounded-md border border-green-100">
                      {lead.value ? `₹${lead.value}` : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{lead.company}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="truncate pr-2">{lead.email}</span>
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {(lead.contactPerson || lead.name).charAt(0)}
                    </div>
                  </div>
                </div>
              ))}
              {pipelineData[stage].length === 0 && (
                <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
