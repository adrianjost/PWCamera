let hasFileAccess = false;
let dirHandle;
let activeVideoStream;

let cameraDevices = [];
let currentCameraIndex = 0;

function runAsync(asnycFunction) {
	asnycFunction().catch(console.error);
}

async function capturePhoto() {
	const imageCapture = new ImageCapture(activeVideoStream.getVideoTracks()[0]);
	const imageBlob = await imageCapture.takePhoto({
		fillLightMode: "auto", // "off", "flash"
		redEyeReduction: true,
	});
	return imageBlob;
}

async function saveCapture(imageBlob) {
	if (!hasFileAccess) {
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

function updateLastImgPreview(imageBlob) {
	const imageUrl = URL.createObjectURL(imageBlob);
	document.getElementById("latest-image").src = imageUrl;
}

async function onCapturePhotoClick(e) {
	e.preventDefault();
	e.stopPropagation();

	runAsync(async () => {
		const imageBlob = await capturePhoto();
		updateLastImgPreview(imageBlob);
		await saveCapture(imageBlob);
	});

	return false;
}
document.getElementById("save").addEventListener("click", onCapturePhotoClick);

const videoElement = document.querySelector("video");
const switchCamera = document.querySelector("#next-camera");

async function updateAvailableCameraDevices() {
	const mediaDevices = await navigator.mediaDevices.enumerateDevices();
	cameraDevices = mediaDevices.filter((device) => device.kind === "videoinput");
}

async function stopActiveVideoTrack() {
	if (activeVideoStream) {
		activeVideoStream.getTracks().forEach((track) => track.stop());
	}
}
async function updateActiveCameraPreview() {
	const newCameraDeviceId = cameraDevices[currentCameraIndex].deviceId;
	activeVideoStream = await navigator.mediaDevices.getUserMedia({
		video: { deviceId: { exact: newCameraDeviceId } },
	});
	videoElement.srcObject = activeVideoStream;
}

async function updateActiveCameraSelection() {
	currentCameraIndex = (currentCameraIndex + 1) % cameraDevices.length;
	switchCamera.innerHTML = (currentCameraIndex + 1).toString();
	await stopActiveVideoTrack();
	await updateActiveCameraPreview();
}

runAsync(async () => {
	await updateAvailableCameraDevices();
	await updateActiveCameraPreview();
});

switchCamera.addEventListener("click", (event) => {
	event.preventDefault();
	event.stopPropagation();

	runAsync(updateActiveCameraSelection);

	return false;
});
