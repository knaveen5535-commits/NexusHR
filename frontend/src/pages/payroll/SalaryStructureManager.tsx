import { useState, useEffect } from 'react';
import { Search, Save, Plus, Trash2, ArrowLeft, History, Zap } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { STANDARD_SALARY_TEMPLATE } from '../../config/salaryTemplates';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  departmentName: string;
  designation: string;
  salary?: number;
}

interface SalaryComponent {
  id?: number;
  name: string;
  componentType: 'EARNING' | 'DEDUCTION';
  valueType: 'FIXED' | 'PERCENTAGE';
  componentValue: number;
}

interface SalaryStructure {
  id?: number;
  employeeId: number;
  baseSalary: number;
  effectiveFrom?: string;
  endDate?: string;
  isActive?: boolean;
  components: SalaryComponent[];
}

interface SalaryStructureManagerProps {
  onClose: () => void;
}

export default function SalaryStructureManager({ onClose }: SalaryStructureManagerProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      // Ensure we have array of employees. Could be wrapped in data
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setEmployees(data);
    } catch (err) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchActiveStructure = async (emp: Employee) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/salary-structures/employee/${emp.id}`);
      if (res.data) {
        setBaseSalary(res.data.baseSalary);
        setComponents(res.data.components || []);
      }
    } catch (err: any) {
      // 404 is expected if they don't have a structure yet
      if (err.response?.status !== 404 && err.response?.status !== 500) {
        toast.error('Failed to fetch active structure');
      }
      
      // Fallback: If no structure exists, use the salary defined in their Employee Profile
      setBaseSalary(emp.salary || 0);
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmp(emp);
    fetchActiveStructure(emp);
  };

  const addComponent = () => {
    setComponents([
      ...components,
      {
        name: '',
        componentType: 'EARNING',
        valueType: 'FIXED',
        componentValue: 0
      }
    ]);
  };

  const applyTemplate = () => {
    // Append template components if they don't already exist to prevent duplicate additions
    const newComponents = [...components];
    let added = 0;
    
    STANDARD_SALARY_TEMPLATE.forEach(templateComp => {
      if (!newComponents.some(c => c.name.toLowerCase() === templateComp.name.toLowerCase())) {
        newComponents.push({ ...templateComp });
        added++;
      }
    });

    if (added > 0) {
      setComponents(newComponents);
      toast.success(`Applied ${added} standard components`);
    } else {
      toast.info('Standard components are already applied');
    }
  };

  const updateComponent = (index: number, field: keyof SalaryComponent, value: any) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    setComponents(updated);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedEmp) return;
    
    // Validation
    if (baseSalary <= 0) {
      toast.error('Base salary must be greater than 0');
      return;
    }
    for (let c of components) {
      if (!c.name.trim()) {
        toast.error('All components must have a name');
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload: SalaryStructure = {
        employeeId: selectedEmp.id,
        baseSalary,
        components
      };

      await api.post('/salary-structures', payload);
      toast.success('Salary Structure saved successfully');
      
      // Refresh
      fetchActiveStructure(selectedEmp);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to save salary structure');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEmployees = employees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (e.employeeCode && e.employeeCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 px-4">
        <button 
          onClick={onClose}
          className="p-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Salary Structures</h2>
          <p className="text-muted-foreground text-sm">Assign custom base salaries and components</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 px-4 overflow-hidden">
        {/* Left Panel - Employee List */}
        <div className="w-1/3 flex flex-col bg-card/50 border border-border rounded-xl backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-950/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredEmployees.map(emp => (
              <div 
                key={emp.id}
                onClick={() => handleSelectEmployee(emp)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                  selectedEmp?.id === emp.id 
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400' 
                    : 'hover:bg-secondary/50 border border-transparent'
                }`}
              >
                <div className="font-semibold text-sm text-foreground">{emp.firstName} {emp.lastName}</div>
                <div className="text-xs text-muted-foreground flex justify-between mt-1">
                  <span>{emp.employeeCode || 'No Code'}</span>
                  <span>{emp.designation || emp.departmentName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Salary Editor */}
        <div className="flex-1 bg-card/50 border border-border rounded-xl backdrop-blur-xl flex flex-col overflow-hidden">
          {!selectedEmp ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <History size={48} className="mb-4 opacity-20" />
              <p>Select an employee from the list to manage their salary.</p>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-6 border-b border-border bg-secondary/10 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedEmp.firstName} {selectedEmp.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmp.designation} • {selectedEmp.departmentName}</p>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                  Save Structure
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Base Salary */}
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Base Salary</h4>
                  <div className="max-w-xs">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input 
                        type="number" 
                        value={baseSalary || ''}
                        onChange={(e) => setBaseSalary(Number(e.target.value))}
                        className="w-full bg-zinc-950/50 border border-border rounded-lg pl-8 pr-4 py-2.5 text-foreground focus:outline-none focus:border-blue-500 text-lg font-bold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Components */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Salary Components</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={applyTemplate}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Zap size={14} /> Apply Standard Template
                      </button>
                      <button 
                        onClick={addComponent}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Plus size={14} /> Add Component
                      </button>
                    </div>
                  </div>

                  {components.length === 0 ? (
                    <div className="text-center py-8 bg-zinc-950/30 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                      No dynamic components added yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {components.map((comp, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-border group hover:border-zinc-700 transition-colors">
                          <input 
                            type="text" 
                            placeholder="Component Name (e.g. HRA)"
                            value={comp.name}
                            onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                            className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none focus:ring-0"
                          />
                          
                          <select 
                            value={comp.componentType}
                            onChange={(e) => updateComponent(idx, 'componentType', e.target.value)}
                            className="bg-secondary/50 border-none rounded-lg text-xs py-2 px-3 text-foreground focus:outline-none cursor-pointer"
                          >
                            <option value="EARNING">Earning</option>
                            <option value="DEDUCTION">Deduction</option>
                          </select>

                          <select 
                            value={comp.valueType}
                            onChange={(e) => updateComponent(idx, 'valueType', e.target.value)}
                            className="bg-secondary/50 border-none rounded-lg text-xs py-2 px-3 text-foreground focus:outline-none cursor-pointer"
                          >
                            <option value="FIXED">Fixed ($)</option>
                            <option value="PERCENTAGE">Percentage (%)</option>
                          </select>

                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                              {comp.valueType === 'PERCENTAGE' ? '%' : '$'}
                            </span>
                            <input 
                              type="number" 
                              value={comp.componentValue || ''}
                              onChange={(e) => updateComponent(idx, 'componentValue', Number(e.target.value))}
                              className="w-full bg-transparent border-l border-r border-border px-8 py-2 text-sm text-foreground focus:outline-none font-semibold text-right"
                              placeholder="0.00"
                            />
                          </div>

                          <button 
                            onClick={() => removeComponent(idx)}
                            className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
