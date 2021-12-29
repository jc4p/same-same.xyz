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

  document.querySelector('.mintButton').onclick = async () => {
    console.log('TODO: Mint')
    alert('mint support incoming, come back soon')
  }

  // clear any old one
  if (document.querySelectorAll('.previewContainer canvas').length > 0) {
    document.querySelectorAll('.previewContainer canvas').forEach(e => container.removeChild(e))
  }
  if (document.querySelectorAll('.previewContainer img').length > 0) {
    document.querySelectorAll('.previewContainer img').forEach(e => container.removeChild(e))
  }

  container.appendChild(canvas);
  container.classList.add('processing');

  canvas.toBlob(async (canvasBlob) => {
    const formData = new FormData();
    formData.append('file', canvasBlob);

    try {
      const res = await fetch('https://api.same-same.xyz/style/', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errorBody = await res.text()
        alert(errorBody)
        container.classList.remove('active');
        document.querySelector('.inputContainer').classList.add('active');
        return
      }

      const imageBlob = await res.blob()
      const imageObjectURL = URL.createObjectURL(imageBlob);

      const newImg = document.createElement('img')

      newImg.onload = () => {
        container.classList.remove('processing');
        document.querySelector('.redoButton').style['display'] = 'block';
        document.querySelector('.mintButton').style['display'] = 'block';
        container.appendChild(newImg)
        container.removeChild(canvas);
      }
      newImg.src = imageObjectURL
    } catch (err) {
      alert(err.message)
      container.classList.remove('active');
      document.querySelector('.inputContainer').classList.add('active');
    }
  });
};

document
  .querySelector('#imgUpload')
  .addEventListener('change', onImageSelected);
