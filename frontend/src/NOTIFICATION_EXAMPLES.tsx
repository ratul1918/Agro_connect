/**
 * EXAMPLE: Using the Toast Notification System
 * 
 * This file demonstrates all patterns for replacing native alerts
 * with the new react-hot-toast notification system.
 */

// ============================================================================
// EXAMPLE 1: Success & Error Notifications (No Dialog)
// ============================================================================

import { useNotification } from '../context/NotificationContext';

export function OrderExample() {
  const { success, error } = useNotification();

  const handlePlaceOrder = async () => {
    try {
      // Place order...
      await api.post('/orders', orderData);
      
      // INSTEAD OF: alert('Order placed successfully!');
      success('Order placed successfully! Pay on delivery.');
    } catch (err) {
      // INSTEAD OF: alert('Failed to place order.');
      error('Failed to place order. Please try again.');
    }
  };

  return <button onClick={handlePlaceOrder}>Place Order</button>;
}

// ============================================================================
// EXAMPLE 2: Confirmation Dialog (Replace confirm())
// ============================================================================

import { useConfirm } from '../components/ConfirmDialog';

export function DeleteCropExample() {
  const { showConfirm, ConfirmDialog } = useConfirm();
  const { success, error } = useNotification();

  const handleDelete = (cropId: number) => {
    // INSTEAD OF: if (confirm('Delete this crop?')) { ... }
    showConfirm(
      'Delete this crop?',
      'This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/crops/${cropId}`);
          success('Crop deleted successfully');
          refreshCrops();
        } catch (err) {
          error('Failed to delete crop');
        }
      },
      true  // isDangerous - makes button red
    );
  };

  return (
    <div>
      <button onClick={() => handleDelete(123)}>Delete Crop</button>
      {/* IMPORTANT: Always render the dialog */}
      {ConfirmDialog}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Prompt Dialog (Replace prompt())
// ============================================================================

import { usePrompt } from '../components/ConfirmDialog';

export function ApproveExportExample() {
  const { showPrompt, PromptDialog } = usePrompt();
  const { success, error } = useNotification();

  const handleApproveExport = (exportId: number) => {
    // INSTEAD OF: const notes = prompt('Enter notes for approval:');
    showPrompt(
      'Enter notes for approval:',
      async (notes) => {
        try {
          await api.put(`/exports/${exportId}/approve`, { notes });
          success('Export approved!');
          refreshExports();
        } catch (err) {
          error('Failed to approve export');
        }
      },
      'Enter any notes...' // placeholder
    );
  };

  return (
    <div>
      <button onClick={() => handleApproveExport(456)}>Approve Export</button>
      {/* IMPORTANT: Always render the dialog */}
      {PromptDialog}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Loading Toast for Long Operations
// ============================================================================

import toast from 'react-hot-toast';

export function ProcessDataExample() {
  const { success, error, loading } = useNotification();

  const handleProcessData = async () => {
    const toastId = loading('Processing your data...');
    
    try {
      await api.post('/process', data, { timeout: 30000 });
      // Update or replace the loading toast
      toast.success('Processing complete!', { id: toastId });
      refreshData();
    } catch (err) {
      toast.error('Processing failed. Please try again.', { id: toastId });
    }
  };

  return <button onClick={handleProcessData}>Process Data</button>;
}

// ============================================================================
// EXAMPLE 5: Complete Component with All Features
// ============================================================================

import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useConfirm, usePrompt } from '../components/ConfirmDialog';

export function CompleteExampleComponent() {
  const { success, error, info } = useNotification();
  const { showConfirm, ConfirmDialog } = useConfirm();
  const { showPrompt, PromptDialog } = usePrompt();
  const [loading, setLoading] = useState(false);

  // Example 1: Simple success/error
  const handleCreate = async () => {
    setLoading(true);
    try {
      await api.post('/items', { name: 'Item' });
      success('Item created successfully!');
    } catch (err) {
      error('Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  // Example 2: With confirmation
  const handleDelete = (id: number) => {
    showConfirm(
      'Delete item?',
      'This cannot be undone.',
      async () => {
        try {
          await api.delete(`/items/${id}`);
          success('Item deleted');
        } catch {
          error('Failed to delete');
        }
      },
      true
    );
  };

  // Example 3: With prompt
  const handleEdit = (id: number) => {
    showPrompt(
      'Enter new name:',
      async (name) => {
        try {
          await api.put(`/items/${id}`, { name });
          success(`Item renamed to "${name}"`);
        } catch {
          error('Failed to rename');
        }
      }
    );
  };

  return (
    <div className="space-y-4 p-4">
      <button onClick={handleCreate} disabled={loading}>
        Create Item
      </button>
      <button onClick={() => handleDelete(1)}>
        Delete Item
      </button>
      <button onClick={() => handleEdit(1)}>
        Edit Item
      </button>

      {/* IMPORTANT: Render both dialogs */}
      {ConfirmDialog}
      {PromptDialog}
    </div>
  );
}

// ============================================================================
// COMPARISON TABLE: Before & After
// ============================================================================

/*
┌─────────────────────┬──────────────────────┬────────────────────────────────┐
│ Original Pattern    │ Implementation       │ New Pattern                    │
├─────────────────────┼──────────────────────┼────────────────────────────────┤
│ alert('Success!')    │ Blocking popup       │ success('Success!')            │
│                     │ Requires click       │ Auto-dismisses in 4s           │
│                     │ One button only      │ Non-blocking, stacks multiple  │
├─────────────────────┼──────────────────────┼────────────────────────────────┤
│ alert('Error!')      │ Blocking popup       │ error('Error!')                │
│                     │ All errors same      │ Can customize per error type   │
│                     │ User disruptive      │ Minimal disruption             │
├─────────────────────┼──────────────────────┼────────────────────────────────┤
│ confirm('Delete?')   │ Blocking modal       │ showConfirm(title, msg,        │
│                     │ 2 buttons (OK/No)    │   callback, isDangerous)       │
│                     │ Limited styling      │ Rich styling, theme-aware      │
├─────────────────────┼──────────────────────┼────────────────────────────────┤
│ prompt('Name?')      │ Blocking modal       │ showPrompt(title, callback,    │
│                     │ Limited input        │   placeholder)                 │
│                     │ No styling           │ Full control, theme-aware      │
└─────────────────────┴──────────────────────┴────────────────────────────────┘
*/

// ============================================================================
// TIPS & TRICKS
// ============================================================================

/*
1. KEEP MESSAGES SHORT
   ✅ "Settings saved"
   ❌ "Your settings have been saved to the database successfully"

2. USE ACTION-ORIENTED LANGUAGE
   ✅ "Blog deleted successfully"
   ❌ "The deletion was successful"

3. INCLUDE ERROR DETAILS WHEN RELEVANT
   ✅ error(`Failed to save: ${error.message}`)
   ❌ error('Failed')

4. USE INFO FOR NEUTRAL UPDATES
   const { info } = useNotification();
   info('Settings will take effect after page reload');

5. CHAIN MULTIPLE NOTIFICATIONS
   success('Changes saved');
   info('Sync in progress...');
   // Later:
   success('Sync complete!');

6. CONDITIONAL MESSAGING FOR DIFFERENT LANGUAGES
   const lang = useLanguage();
   success(lang === 'bn' ? 'সফলভাবে সংরক্ষিত' : 'Saved successfully');

7. USE LOADING TOAST FOR LONG OPERATIONS
   Prevents user from thinking the app is stuck
*/
