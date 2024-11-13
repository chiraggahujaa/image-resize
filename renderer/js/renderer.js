const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

const loadImages = (e) => {
  const file = e.target.files[0];
  const isFileImage = checkIsFileImage(file);
  if (!isFileImage) {
    alert("Please choose an image file.", false);
    return;
  }

  // get orginal dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    const { naturalWidth, naturalHeight } = this;
    widthInput.value = naturalWidth;
    heightInput.value = naturalHeight;
  };

  form.style.display = "block";
  filename.innerText = img.files[0].name;
  outputPath.innerText = path.join(os.homedir, "imageresizer");
};

// Send the form data to the main process
const sendImage = async (e) => {
  e.preventDefault();

  const height = heightInput.value;
  const width = widthInput.value;

  if (!img.files[0]) {
    alert("Please upload an image file.", false);
    return;
  }

  if (height === "" || width === "") {
    alert("Please provide both height and width.", false);
    return;
  }

  const file = img.files[0];
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uint8Array = new Uint8Array(buffer);

  ipcRenderer.send("image:resize", {
    imageBuffer: uint8Array,
    imageName: file.name,
    height,
    width,
  });

  alert("Image resized successfully.", true);
};

ipcRenderer.on("image:done", () =>
  alertSuccess(`Image resized to ${heightInput.value} x ${widthInput.value}`)
);

const checkIsFileImage = (file) => {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
  return acceptedImageTypes.includes(file.type);
};

const alert = (message, isSuccess) => {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    gravity: "top",
    position: "center",
    backgroundColor: isSuccess
      ? "linear-gradient(to right, #00b09b, #96c93d)"
      : "linear-gradient(to right, #ff5f6d, #ffc371)",
    stopOnFocus: true,
    style: {
      color: "white",
      textAlign: "center",
      fontSize: "16px",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "10px 20px",
      margin: "10px",
    },
  });
};

img.addEventListener("change", loadImages);
form.addEventListener("submit", (e) => sendImage(e));
