const previewVideo = document.getElementById("preview");
const takePhotoBtn = document.getElementById("take-photo");
const switchCameraBtn = document.getElementById("switch-camera");
const cameraNumber = switchCameraBtn.querySelector(".camera-number");
const latestPhotoBtn = document.getElementById("show-latest-photo");
const latestPhotoImg = document.getElementById("latest-photo");

let hasFileAccess = false;
let dirHandle;
let activeVideoStream;

let cameraDevices = [];
let currentCameraIndex = 0;

function runAsync(asnycFunction) {
	asnycFunction().catch(console.error);
}

async function takePhoto() {
	const imageCapture = new ImageCapture(activeVideoStream.getVideoTracks()[0]);
	const imageBlob = await imageCapture.takePhoto({
		// no options used because of incompatibility with some devices
		// fillLightMode: "auto", // "off", "flash"
		// redEyeReduction: true,
	});
	return imageBlob;
}

async function savePhoto(imageBlob) {
	if (!hasFileAccess) {
		if(!window.showDirectoryPicker){
			alert("Sorry, your Browser does not support the FileAccess API that is required to save photos to your device.")
		}
		dirHandle = await showDirectoryPicker();
		hasFileAccess = true;
	}
	const now = new Date();
	const filename = `pwcamera-${now.getFullYear()}_${now.getMonth() + 1}_${
		now.getDate() - 1
	}-${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}.png`;
	const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
	const writable = await fileHandle.createWritable();
	await writable.write(imageBlob);
	await writable.close();
}

function updateLastPhotoPreview(imageBlob) {
	const imageUrl = URL.createObjectURL(imageBlob);
	latestPhotoImg.src = imageUrl;
	latestPhotoBtn.setAttribute("tabindex", "3");
}

async function onTakePhotoClick(e) {
	e.preventDefault();
	e.stopPropagation();

	runAsync(async () => {
		const imageBlob = await takePhoto();
		updateLastPhotoPreview(imageBlob);
		await savePhoto(imageBlob);
	});

	return false;
}

async function updateAvailableCameraDevices() {
	if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices){
		alert("Sorry, your browser doesn't support the used APIs. Consider updating.");
	}
	try{
		await navigator.mediaDevices.getUserMedia({
			video: true,
		});
	}catch(error){
		alert("This is a camera app, you must allow camera access to use it.")
	}
	const mediaDevices = await navigator.mediaDevices.enumerateDevices();
	cameraDevices = mediaDevices.filter((device) => device.kind === "videoinput");
}

async function stopActiveVideoTrack() {
	if (activeVideoStream) {
		await Promise.all(activeVideoStream.getTracks().map((track) => track.stop()));
	}
}
async function updateActiveCameraPreview() {
	const newCameraDeviceId = cameraDevices[currentCameraIndex].deviceId;
	if (newCameraDeviceId === "") {
		alert("no camera found");
	}
	activeVideoStream = await navigator.mediaDevices.getUserMedia({
		video: { deviceId: { exact: newCameraDeviceId } },
	});
	previewVideo.srcObject = activeVideoStream;
}

async function updateActiveCameraSelection() {
	currentCameraIndex = (currentCameraIndex + 1) % cameraDevices.length;
	cameraNumber.innerHTML = (currentCameraIndex + 1).toString();
	await stopActiveVideoTrack();
	await updateActiveCameraPreview();
}

takePhotoBtn.addEventListener("click", onTakePhotoClick);
switchCameraBtn.addEventListener("click", (event) => {
	event.preventDefault();
	event.stopPropagation();
	runAsync(updateActiveCameraSelection);
	return false;
});
runAsync(async () => {
	await updateAvailableCameraDevices();
	await updateActiveCameraPreview();
});
