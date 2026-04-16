/**
 * 터치 포인트 데이터 모델
 * 각 손가락의 위치와 고유 색상을 저장
 */
export class CPoint {
    constructor(id, // 터치 이벤트 식별자
    x, // 캔버스 X 좌표
    y, // 캔버스 Y 좌표
    color, // 할당된 고유 색상
    colorIndex // 색상 테이블 인덱스
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        this.colorIndex = colorIndex;
    }
    /** 두 포인트 사이의 거리를 반환 */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
