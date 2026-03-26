import type { Parameter } from '../lib/types';

interface ParamInputProps {
  parameter: Parameter;
  value: string;
  onChange: (next: string) => void;
}

export default function ParamInput({ parameter, value, onChange }: ParamInputProps) {
  return (
    <label className="grid md:grid-cols-[160px_1fr] gap-3 items-start">
      <span className="text-sm">
        {parameter.name} {parameter.required ? <span className="text-[#E4002B]">*</span> : null}
      </span>
      <span>
        <input
          type={parameter.type === 'integer' ? 'number' : 'text'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder={parameter.description}
        />
        <span className="text-xs text-[#666666] mt-1 block">
          {parameter.description} {parameter.example !== undefined ? `Example: ${String(parameter.example)}` : ''}
        </span>
      </span>
    </label>
  );
}
