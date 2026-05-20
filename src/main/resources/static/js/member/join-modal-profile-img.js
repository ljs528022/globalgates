(() => {
  const frame = document.querySelector('.avatar-frame');
  const uploadInput = document.querySelector('.avatar-upload');
  const preview = document.querySelector('.avatar-preview');
  const removeButton = document.querySelector('.avatar-remove');
  const actionButton = document.querySelector('.ghost-button');

  if (!frame || !uploadInput || !preview || !removeButton || !actionButton) {
    return;
  }

  let previewUrl = null;
  const defaultActionText = actionButton.textContent.trim();

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    preview.removeAttribute('src');
    uploadInput.value = '';
    frame.classList.remove('has-image');
    actionButton.classList.remove('ghost-button--primary');
    actionButton.textContent = defaultActionText;
  };

  uploadInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      clearPreview();
      return;
    }

    if (!file.type.startsWith('image/')) {
      clearPreview();
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
    frame.classList.add('has-image');
    actionButton.classList.add('ghost-button--primary');
    actionButton.textContent = '다음';
  });

  removeButton.addEventListener('click', () => {
    clearPreview();
  });
})();

