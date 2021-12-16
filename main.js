import './styles.scss';
import 'cropperjs/dist/cropper.css';

import Cropper from 'cropperjs';

const onImageSelected = (event) => {
  const files = event.target.files;

  const image = document.createElement('img');
  image.src = URL.createObjectURL(files[0]);

  const container = document.querySelector('.pendingContainer');
  document.querySelector('.inputContainer').classList.remove('active');
  container.classList.add('active');

  // clear any old one
  if (document.querySelector('.pendingContainer div')) {
    container.removeChild(document.querySelector('.pendingContainer div'))
    container.removeChild(document.querySelector('.pendingContainer img'))
  }

  container.appendChild(image);

  const cropper = new Cropper(image, {
    aspectRatio: 1.0,
    viewMode: 1,
    autoCropArea: 1.0,
  });

  document.querySelector('.pendingContainer button').onclick = () => {
    onImageReady(cropper.getCroppedCanvas());
    document.querySelector('#imgUpload').value = ''
  }
};

const onImageReady = (canvas) => {
  const container = document.querySelector('.previewContainer');

  document.querySelector('.pendingContainer').classList.remove('active');
  container.classList.add('active');

  document.querySelector('.redoButton').style['display'] = 'none'
  document.querySelector('.mintButton').style['display'] = 'none'

  document.querySelector('.redoButton').onclick = () => {
    container.classList.remove('active');
    document.querySelector('.inputContainer').classList.add('active');
  }

  document.querySelector('.mintButton').onclick = () => {
    alert('mint it!')
  }

  // clear any old one
  if (document.querySelectorAll('.previewContainer canvas').length > 0) {
    document.querySelectorAll('.previewContainer canvas').forEach(e => container.removeChild(e))
  }

  container.appendChild(canvas);
  container.classList.add('processing');

  canvas.toBlob((canvasBlob) => {
    const formData = new FormData();
    formData.append('image', canvasBlob);

    setTimeout(() => {
      container.classList.remove('processing');
      document.querySelector('.redoButton').style['display'] = 'block'
      document.querySelector('.mintButton').style['display'] = 'block'
    }, 2000);
  });
};

document
  .querySelector('#imgUpload')
  .addEventListener('change', onImageSelected);
