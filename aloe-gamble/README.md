# 알로애 게임장

알로애와 함께하는 미니게임 모음: 주사위 대결, 즉석복권, 가위바위보, 배민지 잡기.
매일 한 번 10,000원의 게임머니를 받아 플레이할 수 있습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages 배포

1. `vite.config.js`의 `base`를 본인 레포 이름에 맞게 수정 (`/레포이름/`)
2. 빌드 후 배포

```bash
npm run build
npm run deploy
```

3. 깃허브 레포 Settings > Pages에서 소스를 `gh-pages` 브랜치로 설정
