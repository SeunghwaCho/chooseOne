/**
 * 터치 포인트 데이터 모델
 * 각 손가락의 위치와 고유 색상을 저장
 */
export class CPoint {
  constructor(
    public id: number,       // 터치 이벤트 식별자
    public x: number,        // 캔버스 X 좌표
    public y: number,        // 캔버스 Y 좌표
    public color: string,    // 할당된 고유 색상
    public colorIndex: number // 색상 테이블 인덱스
  ) {}

  /** 두 포인트 사이의 거리를 반환 */
  distanceTo(other: CPoint): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
