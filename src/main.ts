import * as Babylon from 'babylonjs';
import parse from 'csv-parse/lib/sync';
import getPixels from 'get-pixels';

const dom = {
	canvas: document.getElementById("render3d") as HTMLCanvasElement,
	inputZoomLevel: document.getElementById("zoomLevel") as HTMLInputElement,
	inputCoordX: document.getElementById("coord_x") as HTMLInputElement,
	inputCoordY: document.getElementById("coord_y") as HTMLInputElement,
	imgRasterTile: document.getElementById("rasterTileImage") as HTMLImageElement
}

const getDemTile = async (zoomLevel: number, x: number, y: number) => {
	// 地理院標高タイルにアクセス
	const url = `https://cyberjapandata.gsi.go.jp/xyz/dem/${zoomLevel}/${x}/${y}.txt`;
	const rawCsv = await fetch(url).then(response => response.text()).catch(error => {
		throw error;
	});
	const csv: number[][] = parse(rawCsv, {
		columns: false,
		delimiter: ','
	});
	return csv;
}

const getRasterTile = async (zoomLevel: number, x: number, y: number): Promise<Uint8Array> => {
	// 地理院全国ランドサットモザイク画像にアクセス
	const url = `https://cyberjapandata.gsi.go.jp/xyz/lndst/${zoomLevel}/${x}/${y}.png`;
	dom.imgRasterTile.src = url;
	return new Promise((resolve, reject) => {
		getPixels(url, (error, pixels) => {
			if (error) {
				reject(error);
			} else {
				resolve(pixels.data as Uint8Array);
			}
		})
	});
}

// キャンバスを取得
const canvas = document.getElementById("render3d");
// 3Dエンジンを読み込む
const engine = new Babylon.Engine(dom.canvas, true, {
	preserveDrawingBuffer: true,
	stencil: true
});
// ステージのセッティング
const initializeScene = () => {
	// シーンを作成
	const scene = new Babylon.Scene(engine);
	// カメラを作成
	const camera = new Babylon.ArcRotateCamera("camera1", 0, Math.PI / 2.5, 3, new Babylon.Vector3(0, 250, -500), scene);
	camera.setTarget(Babylon.Vector3.Zero());
	camera.attachControl(canvas, false);
	// ライトを作成
	const light = new Babylon.HemisphericLight("light1", new Babylon.Vector3(1000, 1000, 0), scene);
	// グラウンドを作成
	const ground = Babylon.MeshBuilder.CreateGround("ground1", {
		width: 256,
		height: 256,
		subdivisions: 2,
		updatable: false
	}, scene);
	return scene;
}

// 標高タイルのデータからポリゴンを作成
const createPolygons = (scene: Babylon.Scene, demTile: number[][], pixelData?: Uint8Array) => {
	const dest = 5;
	for (let n = 0; n < 256; n = n + dest) {
		for (let m = 0; m < 256; m = m + dest) {
			const height = demTile[n][m] / 10;
			const column = Babylon.MeshBuilder.CreateBox(`column-${n}-${m}`, {
				size: dest,
				width: dest,
				height: height,
				sideOrientation: Babylon.Mesh.FRONTSIDE
			}, scene);
			column.position.x = n - 128;
			column.position.z = m - 128;
			column.position.y = height / 2;
			// ラスター画像がある場合はポリゴンに色付けを行なう
			if (pixelData !== undefined) {
				const index = (m + n * 256) * 4;
				const material = new Babylon.StandardMaterial(`material-${n}-${m}`, scene);
				material.diffuseColor = new Babylon.Color3(
					pixelData[index] / 256,
					pixelData[index + 1] / 256,
					pixelData[index + 2] / 256
				);
				column.material = material;
			}
		}
	}

}

let scene = initializeScene();
engine.runRenderLoop(() => {
	scene.render();
});
window.addEventListener("resize", () => {
	engine.resize();
});


document.getElementById("showButton").addEventListener("click", async () => {
	const zoomLevel = parseInt(dom.inputZoomLevel.value);
	const coord_x = parseInt(dom.inputCoordX.value);
	const coord_y = parseInt(dom.inputCoordY.value);

	const demTile = await getDemTile(zoomLevel, coord_x, coord_y);
	const pixelData = await getRasterTile(zoomLevel, coord_x, coord_y);
	console.log(pixelData);
	scene = initializeScene();
	createPolygons(scene, demTile, pixelData);
});