import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Image, Type, Video, CheckSquare, Flag, MessageSquare, FileAudio, FileVideo } from 'lucide-react';

const NodeContainer = ({ children, selected, title, icon: Icon, color = "bg-white" }: any) => (
  <div className={`shadow-lg rounded-xl border-2 w-64 overflow-hidden transition-all ${selected ? 'border-vandora-emerald ring-2 ring-emerald-100' : 'border-gray-200'}`}>
    <div className={`p-3 border-b border-gray-100 flex items-center space-x-2 ${color}`}>
      {Icon && <Icon className="w-4 h-4 text-gray-600" />}
      <span className="font-bold text-sm text-gray-700">{title}</span>
    </div>
    <div className="p-4 bg-white">
      {children}
    </div>
  </div>
);

const MediaPreview = ({ data }: { data: any }) => {
  const mediaUrl = data.media || data.image;
  if (!mediaUrl) return null;

  const type = data.mediaType || 'image';

  if (type === 'image') {
    return <img src={mediaUrl} alt="" className="w-full h-24 object-cover rounded mb-2" />;
  } else if (type === 'video') {
    return (
      <div className="w-full h-24 bg-gray-900 rounded mb-2 flex items-center justify-center relative overflow-hidden">
        <video src={mediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <FileVideo className="text-white w-8 h-8 relative z-10" />
      </div>
    );
  } else if (type === 'audio') {
    return (
      <div className="w-full h-12 bg-gray-100 rounded mb-2 flex items-center justify-center border border-gray-200">
        <FileAudio className="text-gray-600 w-6 h-6 mr-2" />
        <span className="text-xs text-gray-500">Audio Clip</span>
      </div>
    );
  }
  return null;
};

export const WelcomeNode = memo(({ data, selected }: any) => {
  return (
    <NodeContainer selected={selected} title="Portada / Bienvenida" icon={Flag} color="bg-blue-50">
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
      <div className="text-xs text-gray-500 mb-2">Pantalla de inicio</div>
      <MediaPreview data={data} />
      <div className="font-medium text-sm truncate">{data.title || 'Título del Quiz'}</div>
    </NodeContainer>
  );
});

export const QuestionNode = memo(({ data, selected }: any) => {
  return (
    <NodeContainer selected={selected} title="Pregunta" icon={MessageSquare} color="bg-yellow-50">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <div className="text-sm font-medium mb-2 line-clamp-2">{data.question || 'Escribe tu pregunta...'}</div>
      <MediaPreview data={data} />
      <div className="space-y-1">
        {data.options?.slice(0, 3).map((opt: any, i: number) => (
          <div key={i} className="text-xs bg-gray-50 p-1.5 rounded border border-gray-100 flex items-center">
             {opt.media && <img src={opt.media} className="w-4 h-4 rounded mr-2 object-cover" />}
             <span className="truncate">{opt.label}</span>
          </div>
        ))}
        {data.options?.length > 3 && <div className="text-xs text-gray-400 text-center">+ {data.options.length - 3} más</div>}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500" />
    </NodeContainer>
  );
});

export const ResultNode = memo(({ data, selected }: any) => {
  return (
    <NodeContainer selected={selected} title="Resultado / Final" icon={CheckSquare} color="bg-green-50">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <div className="text-center">
        <div className="text-2xl mb-1">🎉</div>
        <div className="font-medium text-sm text-green-800">{data.title || 'Resultado Final'}</div>
        <div className="text-xs text-gray-500 mt-1">Producto: {data.productName || 'Ninguno'}</div>
      </div>
    </NodeContainer>
  );
});

export const nodeTypes = {
  welcome: WelcomeNode,
  question: QuestionNode,
  result: ResultNode,
};
