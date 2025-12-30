import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Key, Check, X, AlertCircle, RefreshCw, Eye, EyeOff, Plus, Trash2, Edit, Save } from 'lucide-react';
import api from '../../api/axios';

interface AIApiKey {
  id?: number;
  provider: string;
  apiKeyEncrypted: string;
  keyType: 'PRODUCTION' | 'TESTING';
  isActive: boolean;
  validationStatus: 'VALID' | 'INVALID' | 'PENDING' | 'EXPIRED';
  lastValidated?: string;
  createdAt?: string;
  updatedAt?: string;
}



const AdminApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<AIApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: '',
    keyType: 'PRODUCTION' as 'PRODUCTION' | 'TESTING'
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [validating, setValidating] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/api/admin/ai-keys');
      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSaveApiKey = async () => {
    setSaving(true);
    try {
      const response = await api.post(`/api/admin/ai-keys/google`, {
        apiKey: formData.apiKey,
        keyType: formData.keyType
      });

      if (response.data.success) {
        await fetchApiKeys();
        setShowAddForm(false);
        setFormData({ apiKey: '', keyType: 'PRODUCTION' });
        alert('Gemini API key saved successfully!');
      } else {
        alert('Failed to save API key: ' + response.data.message);
      }
    } catch (error: any) {
      alert('Error saving API key: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateApiKey = async (provider: string) => {
    setSaving(true);
    try {
      const response = await api.put(`/api/admin/ai-keys/${provider}`, {
        apiKey: formData.apiKey,
        keyType: formData.keyType
      });

      if (response.data.success) {
        await fetchApiKeys();
        setEditingKey(null);
        setFormData({ apiKey: '', keyType: 'PRODUCTION' });
        alert('API key updated successfully!');
      } else {
        alert('Failed to update API key: ' + response.data.message);
      }
    } catch (error: any) {
      alert('Error updating API key: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to delete the Gemini API key?')) {
      return;
    }

    try {
      const googleKey = apiKeys.find(k => k.provider === 'google');
      if (!googleKey?.id) {
        alert('No Gemini API key found to delete');
        return;
      }
      
      const response = await api.delete(`/api/admin/ai-keys/${googleKey.id}`);
      if (response.data.success) {
        await fetchApiKeys();
        alert('Gemini API key deleted successfully!');
      }
    } catch (error: any) {
      alert('Error deleting Gemini API key: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await api.patch(`/api/admin/ai-keys/${id}/toggle`, { isActive });
      if (response.data.success) {
        await fetchApiKeys();
      }
    } catch (error: any) {
      alert('Error toggling status: ' + (error.response?.data?.message || error.message));
    }
  };

  const validateApiKey = (key: string): boolean => {
    if (!key || key.length < 20) return false;
    return key.startsWith('AIza');
  };

  const handleValidateKey = async (provider: string) => {
    setValidating(prev => new Set(prev).add(provider));
    try {
      const response = await api.post(`/api/admin/ai-keys/${provider}/validate`);
      if (response.data.success) {
        await fetchApiKeys();
        alert(response.data.isValid ? 'Gemini API key is valid!' : 'Gemini API key validation failed');
      }
    } catch (error: any) {
      alert('Error validating Gemini key: ' + (error.response?.data?.message || error.message));
    } finally {
      setValidating(prev => {
        const newSet = new Set(prev);
        newSet.delete(provider);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      VALID: { color: 'bg-green-100 text-green-800', icon: Check, label: 'Valid' },
      INVALID: { color: 'bg-red-100 text-red-800', icon: X, label: 'Invalid' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Pending' },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', icon: X, label: 'Expired' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const toggleKeyVisibility = (provider: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return newSet;
    });
  };

  const startEditing = (key: AIApiKey) => {
    setEditingKey(key.provider);
    setFormData({
      apiKey: '', // Don't pre-fill for security
      keyType: key.keyType
    });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const getStatusSummary = () => {
    if (apiKeys.length === 0) {
      return { status: 'not-configured', color: 'yellow', text: 'Not Configured', icon: '⚠️' };
    }
    const activeKey = apiKeys.find(k => k.isActive);
    if (!activeKey) {
      return { status: 'inactive', color: 'slate', text: 'Inactive', icon: '⏸️' };
    }
    if (activeKey.validationStatus === 'VALID') {
      return { status: 'valid', color: 'emerald', text: 'Active & Valid', icon: '✅' };
    }
    return { status: 'invalid', color: 'red', text: 'Invalid', icon: '❌' };
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="space-y-6">
      {/* Status Summary Card */}
      <div className={`${statusSummary.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' : statusSummary.color === 'slate' ? 'bg-slate-50 border-slate-200' : statusSummary.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${statusSummary.color === 'yellow' ? 'bg-yellow-100' : statusSummary.color === 'slate' ? 'bg-slate-100' : statusSummary.color === 'emerald' ? 'bg-emerald-100' : 'bg-red-100'} rounded-full flex items-center justify-center text-lg`}>
            {statusSummary.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Gemini API Status</h3>
            <p className="text-sm text-gray-600">{statusSummary.text}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Key className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <CardTitle>Gemini API Key Management</CardTitle>
                <CardDescription>
                  Manage your Google Gemini API key for AI chat functionality
                  {apiKeys.length > 0 && apiKeys.some(k => k.isActive && k.validationStatus === 'VALID') && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">✅ Active & Valid</span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Gemini API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 border-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Add New Gemini API Key</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value="Google Gemini"
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Gemini API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Gemini API key (starts with AIza...)"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      <strong>🔑 Key Format:</strong> Must start with "AIza" and be at least 20 characters long
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-xs text-blue-800">
                        <strong>💡 Where to get your key:</strong> Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Google AI Studio</a> → Create API Key → Copy and paste here
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveApiKey} disabled={saving || !formData.apiKey}>
                    {saving ? 'Saving...' : 'Save Gemini API Key'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Gemini API Key</h3>
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.provider} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">Gemini API Key</h3>
                        {getStatusBadge(apiKey.validationStatus)}
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{apiKey.keyType}</Badge>
                      </div>
                      
                      {editingKey === apiKey.provider ? (
                        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                          <div className="space-y-2">
                            <Label>New API Key</Label>
                            <Input
                              type="password"
                              placeholder="Enter new API key"
                              value={formData.apiKey}
                              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateApiKey(apiKey.provider)} disabled={saving || !formData.apiKey}>
                              <Save className="w-4 h-4 mr-2" />
                              {saving ? 'Updating...' : 'Update'}
                            </Button>
                            <Button variant="outline" onClick={() => setEditingKey(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">API Key:</Label>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {visibleKeys.has(apiKey.provider) ? apiKey.apiKeyEncrypted : '••••••••••••••••'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleKeyVisibility(apiKey.provider)}
                            >
                              {visibleKeys.has(apiKey.provider) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          {apiKey.lastValidated && (
                            <p className="text-xs text-muted-foreground">
                              Last validated: {new Date(apiKey.lastValidated).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidateKey(apiKey.provider)}
                        disabled={validating.has(apiKey.provider)}
                      >
                        {validating.has(apiKey.provider) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Validate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(apiKey)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(apiKey.id!, !apiKey.isActive)}
                      >
                        {apiKey.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteApiKey}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {apiKeys.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-6">
                  <Key className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                  <p className="text-lg font-medium text-gray-800">No Gemini API Key Found</p>
                  <p className="text-sm text-gray-600 mb-4">Add your Gemini API key to enable AI chat functionality</p>
                  <div className="bg-white rounded-lg p-3 text-left">
                    <p className="text-xs font-semibold text-gray-700 mb-2">📋 Quick Setup Steps:</p>
                    <ol className="text-xs text-gray-600 space-y-1 ml-4">
                      <li>1. Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                      <li>2. Sign in with your Google account</li>
                      <li>3. Click "Create API Key" and copy the key</li>
                      <li>4. Click "Add Gemini API Key" above and paste it</li>
                      <li>5. Click "Validate" to test your key</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApiKeys;