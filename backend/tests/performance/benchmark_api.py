"""
API Performance Benchmark Script

백엔드 API 엔드포인트의 응답 시간을 측정합니다.
폐쇄망 환경에서 실행 가능한 성능 벤치마크 도구입니다.
"""

import time
import statistics
import asyncio
from typing import List, Dict, Any
import httpx


class APIBenchmark:
    """API 성능 벤치마크 클래스"""

    def __init__(self, base_url: str = "http://localhost:8000/api/v1"):
        self.base_url = base_url
        self.results: Dict[str, Any] = {}

    async def measure_endpoint(
        self,
        method: str,
        endpoint: str,
        iterations: int = 10,
        **kwargs
    ) -> Dict[str, float]:
        """
        특정 엔드포인트의 응답 시간을 측정합니다.

        Args:
            method: HTTP 메서드 (GET, POST, etc.)
            endpoint: API 엔드포인트 경로
            iterations: 측정 반복 횟수
            **kwargs: 추가 요청 파라미터

        Returns:
            응답 시간 통계 (평균, 중앙값, 최소, 최대, 표준편차)
        """
        url = f"{self.base_url}{endpoint}"
        response_times: List[float] = []

        async with httpx.AsyncClient() as client:
            # Warm-up 요청 (첫 요청은 초기화 시간이 포함될 수 있음)
            try:
                await client.request(method, url, **kwargs)
            except Exception:
                pass  # Warm-up 실패는 무시

            # 실제 측정
            for _ in range(iterations):
                start_time = time.perf_counter()
                try:
                    response = await client.request(method, url, timeout=10.0, **kwargs)
                    end_time = time.perf_counter()

                    if response.status_code < 400:
                        response_times.append((end_time - start_time) * 1000)  # ms로 변환
                except Exception as e:
                    print(f"❌ 요청 실패: {url} - {str(e)}")
                    continue

        if not response_times:
            return {
                "avg": 0,
                "median": 0,
                "min": 0,
                "max": 0,
                "std_dev": 0,
                "samples": 0
            }

        return {
            "avg": statistics.mean(response_times),
            "median": statistics.median(response_times),
            "min": min(response_times),
            "max": max(response_times),
            "std_dev": statistics.stdev(response_times) if len(response_times) > 1 else 0,
            "samples": len(response_times)
        }

    async def run_benchmarks(self) -> Dict[str, Any]:
        """모든 벤치마크를 실행합니다."""
        print("=" * 60)
        print("🚀 API Performance Benchmark Started")
        print("=" * 60)
        print()

        benchmarks = [
            # 프로젝트 API
            ("GET", "/projects/", "프로젝트 목록 조회"),
            ("GET", "/projects/1", "프로젝트 단일 조회"),

            # 태스크 API
            ("GET", "/projects/1/tasks/", "태스크 목록 조회"),
            ("GET", "/tasks/1", "태스크 단일 조회"),

            # Enabler API
            ("GET", "/projects/1/enablers/", "Enabler 목록 조회"),

            # 의존성 API
            ("GET", "/projects/1/dependencies/", "의존성 목록 조회"),

            # Health Check (가장 기본적인 엔드포인트)
            ("GET", "/", "Health Check"),
        ]

        for method, endpoint, description in benchmarks:
            print(f"📊 {description} ({method} {endpoint})")

            result = await self.measure_endpoint(method, endpoint, iterations=10)

            if result["samples"] > 0:
                print(f"   평균: {result['avg']:.2f}ms")
                print(f"   중앙값: {result['median']:.2f}ms")
                print(f"   최소: {result['min']:.2f}ms")
                print(f"   최대: {result['max']:.2f}ms")
                print(f"   표준편차: {result['std_dev']:.2f}ms")

                # 목표치 비교
                if result['avg'] < 50:
                    status = "✅ 우수"
                elif result['avg'] < 100:
                    status = "✅ 양호"
                elif result['avg'] < 200:
                    status = "⚠️ 보통"
                else:
                    status = "❌ 개선 필요"
                print(f"   상태: {status}")
            else:
                print(f"   ❌ 측정 실패 (서버 미실행 또는 엔드포인트 없음)")

            print()

            self.results[description] = result

        return self.results

    def print_summary(self):
        """벤치마크 결과 요약을 출력합니다."""
        print("=" * 60)
        print("📈 Performance Benchmark Summary")
        print("=" * 60)
        print()

        successful_tests = [r for r in self.results.values() if r["samples"] > 0]

        if not successful_tests:
            print("❌ 모든 테스트 실패")
            print("   서버가 실행 중인지 확인하세요: http://localhost:8000")
            return

        avg_times = [r["avg"] for r in successful_tests]

        print(f"총 테스트: {len(self.results)}")
        print(f"성공: {len(successful_tests)}")
        print(f"실패: {len(self.results) - len(successful_tests)}")
        print()
        print(f"전체 평균 응답 시간: {statistics.mean(avg_times):.2f}ms")
        print(f"전체 중앙값 응답 시간: {statistics.median(avg_times):.2f}ms")
        print()

        # 목표치 달성 여부
        print("🎯 성능 목표 달성 현황:")

        avg_response_time = statistics.mean(avg_times)

        if avg_response_time < 100:
            print(f"   ✅ API 응답 시간 < 100ms 목표 달성! ({avg_response_time:.2f}ms)")
        else:
            print(f"   ❌ API 응답 시간 목표 미달성 ({avg_response_time:.2f}ms / 목표: 100ms)")

        print()


async def main():
    """메인 실행 함수"""
    benchmark = APIBenchmark()

    try:
        await benchmark.run_benchmarks()
        benchmark.print_summary()
    except Exception as e:
        print(f"❌ 벤치마크 실행 중 오류 발생: {str(e)}")
        print()
        print("💡 해결 방법:")
        print("   1. 백엔드 서버가 실행 중인지 확인: uvicorn app.main:app --reload")
        print("   2. 서버 주소가 올바른지 확인: http://localhost:8000")
        print("   3. 데이터베이스가 초기화되었는지 확인")


if __name__ == "__main__":
    asyncio.run(main())
