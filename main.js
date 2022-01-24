import './styles.scss';
import 'cropperjs/dist/cropper.css';
import MicroModal from 'micromodal';
import Cropper from 'cropperjs';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { ethers } from 'ethers';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "c4608deaf14544448854ab493f73f1c7"
    }
  }
};

const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: true,
  providerOptions: providerOptions
});

let web3Instance, web3Provider;

const showInfoPopup = () => {
  if (document.querySelector('#info-popup').classList.contains('is-open')) {
    MicroModal.close('info-popup')
  } else {
    MicroModal.show('info-popup')
  }
}

const showMintPopup = async () => {
  MicroModal.show('mint-popup')

  if (!web3Provider) {
    return
  }

  try {
    const address = await web3Provider.getSigner().getAddress();
    if (address) {
      document.querySelector("#addressLabel").textContent = "Logged in as: " + address
      document.querySelector('#mint-popup .walletConnectContainer').classList.remove('active')
      document.querySelector('#mint-popup .mintContainer').classList.add('active')
    }
  } catch (err) {
    alert(err)
    console.log('error: ', err)
  }
}

const connectButtonListener = async () => {
  web3Instance = await web3Modal.connect();

  web3Provider = new ethers.providers.Web3Provider(web3Instance);
  const address = await web3Provider.getSigner().getAddress();

  document.querySelector("#addressLabel").textContent = "Logged in as: " + address
  document.querySelector('#mint-popup .walletConnectContainer').classList.remove('active')
  document.querySelector('#mint-popup .mintContainer').classList.add('active')
}
document.querySelector('.walletConnectButton').addEventListener('click', connectButtonListener)

const finalMintButtonListener = async () => {
  if (!web3Provider) { return }

  // try to call a function on the contract?
}
document.querySelector('#mint-popup .mintButton').addEventListener('click', connectButtonListener)

const onImageSelected = (event) => {
  const image = document.createElement('img');

  const files = event.target.files;
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
    showMintPopup()
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

document.querySelector('#imgUpload').addEventListener('change', onImageSelected);
document.querySelector('.continueButton').addEventListener('click', onImageSelected);
document.querySelector('.infoButton').addEventListener('click', showInfoPopup);