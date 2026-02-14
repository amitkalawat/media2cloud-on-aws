import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Attribute {
  key: string;
  value: string;
}

interface MetadataFormProps {
  groupName: string;
  onGroupNameChange: (name: string) => void;
  attributes: Attribute[];
  onAttributesChange: (attrs: Attribute[]) => void;
}

export function MetadataForm({
  groupName,
  onGroupNameChange,
  attributes,
  onAttributesChange,
}: MetadataFormProps) {
  const addAttribute = () => {
    onAttributesChange([...attributes, { key: '', value: '' }]);
  };

  const updateAttribute = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], [field]: val };
    onAttributesChange(updated);
  };

  const removeAttribute = (index: number) => {
    onAttributesChange(attributes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="groupName" className="text-sm font-medium text-text">
          Group Name
        </label>
        <Input
          id="groupName"
          placeholder="Optional group name for this batch"
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
        />
        <p className="text-xs text-text-secondary">
          Group uploaded files together for easier browsing.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text">Custom Attributes</label>
          <Button variant="outline" size="sm" onClick={addAttribute}>
            <Plus className="mr-1 h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        {attributes.length === 0 && (
          <p className="text-sm text-text-secondary py-4 text-center">
            No custom attributes. Click "Add Attribute" to add key-value pairs.
          </p>
        )}

        {attributes.map((attr, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              placeholder="Key"
              value={attr.key}
              onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={attr.value}
              onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeAttribute(idx)}>
              <Trash2 className="h-4 w-4 text-text-secondary" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
