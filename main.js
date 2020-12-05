let dirHandle;
let hasFileAccess = false;
let activeVideoStream;

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
	}
	const now = new Date();
	const filename = `webimage_${now.getFullYear()}_${now.getMonth() + 1}_${
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
};
document.getElementById("save").addEventListener("click", onCapturePhotoClick);

var videoElement = document.querySelector("video");
var videoSelect = document.querySelector("select#videoSource");
videoSelect.onchange = updateCameraSelection;

runAsync(async () => {
	await updateCameraOptions();
	await updateCameraSelection();
});

async function updateCameraOptions() {
	const mediaDevices = await navigator.mediaDevices.enumerateDevices();
	const cameraDevices = mediaDevices.filter(
		(device) => device.kind === "videoinput"
	);
	cameraDevices.forEach((camera, index) => {
		const optionElement = document.createElement("option");
		optionElement.value = camera.deviceId;
		optionElement.text = camera.label || `Camera ${index + 1}`;
		videoSelect.appendChild(optionElement);
	});
}

async function stopActiveVideoStream() {
	if (activeVideoStream) {
		activeVideoStream.getTracks().forEach((track) => track.stop());
	}
}
async function updateCameraSelection() {
	stopActiveVideoStream();
	const newCameraDeviceId = videoSelect.value;
	const activeVideoStream = await navigator.mediaDevices.getUserMedia({
		video: { deviceId: { exact: newCameraDeviceId } },
	});
	videoElement.srcObject = activeVideoStream;
}
