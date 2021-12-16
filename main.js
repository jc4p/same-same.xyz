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

  container.appendChild(image);

  const cropper = new Cropper(image, {
    aspectRatio: 1.0,
    viewMode: 1,
    autoCropArea: 1.0,
  });

  document
    .querySelector('.pendingContainer button')
    .addEventListener('click', () => {
      onImageReady(cropper.getCroppedCanvas());
    });
};

const onImageReady = (canvas) => {
  const container = document.querySelector('.previewContainer');

  document.querySelector('.pendingContainer').classList.remove('active');
  container.classList.add('active');

  container.appendChild(canvas);
  container.classList.add('processing');

  canvas.toBlob((canvasBlob) => {
    const formData = new FormData();
    formData.append('image', canvasBlob);
    // #TODO: Send the image to the API, wait for the result, show it!
    // and then...
    container.classList.remove('processing');
  });
};

document
  .querySelector('#imgUpload')
  .addEventListener('change', onImageSelected);
