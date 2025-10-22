// PickerManager.ts
let currentPicker: { close: () => void } | null = null;

export const setActivePicker = (picker: { close: () => void }) => {
  if (currentPicker && currentPicker !== picker) {
    currentPicker.close(); // close previous picker
  }
  currentPicker = picker;
};

export const clearActivePicker = (picker: { close: () => void }) => {
  if (currentPicker === picker) {
    currentPicker = null;
  }
};
