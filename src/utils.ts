// input要素の入力値を取得する関数
export const getInputValues = () => {
	const inputZoomLevel = document.getElementById("zoomLevel") as HTMLInputElement;
	const inputX = document.getElementById("coord_x") as HTMLInputElement;
	const inputY = document.getElementById("coord_y") as HTMLInputElement;
	const selectTile = document.getElementById("rasterTileSelect") as HTMLSelectElement;
	return {
		zoomLevel: parseInt(inputZoomLevel.value),
		coord_x: parseInt(inputX.value),
		coord_y: parseInt(inputY.value),
		tileUrl: selectTile.value
	}
}

export const xyz2url = (tileUrl: string, xyz: { zoomLevel: number, coord_x: number, coord_y: number }) => {
	return tileUrl.replace("{z}", xyz.zoomLevel.toString()).replace("{x}", xyz.coord_x.toString()).replace("{y}", xyz.coord_y.toString());
}