/* =========================================================
   설천고 Basketball Analytics PRO
   app.js
   ========================================================= */

/* =========================================================
   1. 기본 설정
========================================================= */

const APP_NAME = "설천고 Basketball Analytics PRO";
const STORAGE_KEY = "seolcheon_basketball_pro_v1";

const DEFAULT_DATA = {
    settings: {
        school: "설천고",
        league: "설천고 3x3 농구 리그",
        gameMinutes: 15
    },

    teams: [
        {
            id: "team1",
            name: "설천고 A",
            played: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0
        },
        {
            id: "team2",
            name: "설천고 B",
            played: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0
        },
        {
            id: "team3",
            name: "설천고 C",
            played: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0
        },
        {
            id: "team4",
            name: "설천고 D",
            played: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0
        },
        {
            id: "team5",
            name: "설천고 E",
            played: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0
        }
    ],

    players: [
        {
            id: "p1",
            number: 1,
            name: "선수 1",
            position: "G",
            teamId: "team1"
        },
        {
            id: "p2",
            number: 2,
            name: "선수 2",
            position: "G",
            teamId: "team1"
        },
        {
            id: "p3",
            number: 3,
            name: "선수 3",
            position: "F",
            teamId: "team1"
        },
        {
            id: "p4",
            number: 4,
            name: "선수 4",
            position: "G",
            teamId: "team2"
        },
        {
            id: "p5",
            number: 5,
            name: "선수 5",
            position: "F",
            teamId: "team2"
        },
        {
            id: "p6",
            number: 6,
            name: "선수 6",
            position: "C",
            teamId: "team2"
        }
    ],

    games: [],

    currentGame: null,

    selectedPlayerId: "p1",

    heatmapFilter: "all"
};


/* =========================================================
   2. 상태 불러오기
========================================================= */

let data = loadData();


function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(DEFAULT_DATA);
        }

        const parsed =
            JSON.parse(saved);

        return {
            ...structuredClone(DEFAULT_DATA),
            ...parsed
        };

    } catch (error) {

        console.error(
            "데이터 불러오기 실패:",
            error
        );

        return structuredClone(DEFAULT_DATA);
    }
}


/* =========================================================
   3. 저장
========================================================= */

function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "데이터 저장 실패:",
            error
        );
    }
}


/* =========================================================
   4. 유틸리티
========================================================= */

function uid(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


function $(selector) {
    return document.querySelector(selector);
}


function $$(selector) {
    return [
        ...document.querySelectorAll(selector)
    ];
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function average(array) {

    if (!array.length) return 0;

    return (
        array.reduce(
            (sum, value) =>
                sum + Number(value || 0),
            0
        ) / array.length
    );
}


function formatDate(date = new Date()) {

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).format(date);
}


function showToast(message) {

    let toast =
        $("#toast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "toast";

        toast.className =
            "toast";

        document.body.appendChild(toast);
    }

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(
            () => {
                toast.classList.remove("show");
            },
            2500
        );
}


/* =========================================================
   5. 페이지 이동
========================================================= */

function initNavigation() {

    $$(".nav-button").forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.page;

                    if (!target) return;

                    navigate(target);
                }
            );
        }
    );
}


function navigate(pageName) {

    $$(".page").forEach(
        page => {

            page.classList.remove(
                "active"
            );
        }
    );

    const target =
        document.getElementById(
            `page-${pageName}`
        );

    if (target) {

        target.classList.add(
            "active"
        );
    }

    $$(".nav-button").forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageName
            );
        }
    );

    renderPage(pageName);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   6. 페이지 렌더링
========================================================= */

function renderPage(pageName) {

    switch (pageName) {

        case "dashboard":
            renderDashboard();
            break;

        case "game":
            renderGame();
            break;

        case "analysis":
            renderAnalysis();
            break;

        case "report":
            renderReport();
            break;

        case "players":
            renderPlayers();
            break;

        case "league":
            renderLeague();
            break;

        case "video":
            renderVideoPage();
            break;

        case "training":
            renderTraining();
            break;

        case "data":
            renderDataPage();
            break;

        default:
            renderDashboard();
    }
}


/* =========================================================
   7. 선수 통계 계산
========================================================= */

function getPlayerStats(playerId) {

    const stats = {
        games: 0,

        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,

        turnovers: 0,
        fouls: 0,

        fgMade: 0,
        fgAttempted: 0,

        twoMade: 0,
        twoAttempted: 0,

        threeMade: 0,
        threeAttempted: 0,

        ftMade: 0,
        ftAttempted: 0,

        shots: [],

        plusMinus: 0,

        minutes: 0
    };

    data.games.forEach(
        game => {

            const player =
                game.players?.[playerId];

            if (!player) return;

            stats.games++;

            stats.points +=
                player.points || 0;

            stats.rebounds +=
                player.rebounds || 0;

            stats.assists +=
                player.assists || 0;

            stats.steals +=
                player.steals || 0;

            stats.blocks +=
                player.blocks || 0;

            stats.turnovers +=
                player.turnovers || 0;

            stats.fouls +=
                player.fouls || 0;

            stats.fgMade +=
                player.fgMade || 0;

            stats.fgAttempted +=
                player.fgAttempted || 0;

            stats.twoMade +=
                player.twoMade || 0;

            stats.twoAttempted +=
                player.twoAttempted || 0;

            stats.threeMade +=
                player.threeMade || 0;

            stats.threeAttempted +=
                player.threeAttempted || 0;

            stats.ftMade +=
                player.ftMade || 0;

            stats.ftAttempted +=
                player.ftAttempted || 0;

            stats.plusMinus +=
                player.plusMinus || 0;

            stats.minutes +=
                player.minutes || 0;

            if (Array.isArray(player.shots)) {

                stats.shots.push(
                    ...player.shots
                );
            }
        }
    );

    return stats;
}


/* =========================================================
   8. 선수 평점
========================================================= */

function calculatePlayerRating(stats) {

    if (!stats.games) return 0;

    const perGame =
        value =>
            value / stats.games;

    const score =

        perGame(stats.points) * 1.4 +

        perGame(stats.rebounds) * .9 +

        perGame(stats.assists) * 1.2 +

        perGame(stats.steals) * 1.1 +

        perGame(stats.blocks) * 1.0 +

        perGame(stats.plusMinus) * .25 -

        perGame(stats.turnovers) * 1.1 -

        perGame(stats.fouls) * .4;

    return clamp(
        Math.round(
            50 + score * 3
        ),
        0,
        99
    );
}


/* =========================================================
   9. 슛 성공률
========================================================= */

function getFGPercent(stats) {

    if (!stats.fgAttempted) return 0;

    return (
        stats.fgMade /
        stats.fgAttempted *
        100
    );
}


function getThreePercent(stats) {

    if (!stats.threeAttempted) return 0;

    return (
        stats.threeMade /
        stats.threeAttempted *
        100
    );
}


function getFTPercent(stats) {

    if (!stats.ftAttempted) return 0;

    return (
        stats.ftMade /
        stats.ftAttempted *
        100
    );
}


/* =========================================================
   10. 플레이스타일 AI 분석
========================================================= */

function analyzePlayerStyle(stats) {

    if (!stats.games) {

        return {
            style: "분석 데이터 부족",
            description:
                "경기 데이터가 쌓이면 플레이스타일을 자동 분석합니다.",
            tags: [],
            strengths: [],
            weaknesses: []
        };
    }

    const ppg =
        stats.points /
        stats.games;

    const apg =
        stats.assists /
        stats.games;

    const rpg =
        stats.rebounds /
        stats.games;

    const spg =
        stats.steals /
        stats.games;

    const tpg =
        stats.turnovers /
        stats.games;

    const threeRate =
        stats.threeAttempted /
        Math.max(
            stats.fgAttempted,
            1
        );

    let style =
        "밸런스형";

    if (
        ppg >= 10 &&
        apg >= 2
    ) {
        style =
            "공격형 플레이메이커";
    } else if (
        ppg >= 10
    ) {
        style =
            "스코어러";
    } else if (
        apg >= 3
    ) {
        style =
            "플레이메이커";
    } else if (
        rpg >= 6
    ) {
        style =
            "리바운드·인사이드형";
    } else if (
        spg >= 2
    ) {
        style =
            "수비 압박형";
    } else if (
        threeRate >= .45
    ) {
        style =
            "3점 스페셜리스트";
    }

    const strengths = [];
    const weaknesses = [];
    const tags = [];

    if (ppg >= 10) {

        strengths.push(
            "득점 생산력"
        );

        tags.push(
            "SCORER"
        );
    }

    if (apg >= 3) {

        strengths.push(
            "패스·게임메이킹"
        );

        tags.push(
            "PLAYMAKER"
        );
    }

    if (rpg >= 5) {

        strengths.push(
            "리바운드"
        );

        tags.push(
            "REBOUNDER"
        );
    }

    if (spg >= 1.5) {

        strengths.push(
            "수비 활동량"
        );

        tags.push(
            "DEFENDER"
        );
    }

    if (
        getThreePercent(stats) >= 35
    ) {

        strengths.push(
            "3점 슈팅"
        );

        tags.push(
            "SHOOTER"
        );
    }

    if (tpg >= 3) {

        weaknesses.push(
            "턴오버 관리"
        );
    }

    if (
        getFGPercent(stats) < 40 &&
        stats.fgAttempted >= 10
    ) {

        weaknesses.push(
            "야투 효율"
        );
    }

    if (
        apg < 1 &&
        ppg >= 8
    ) {

        weaknesses.push(
            "패스 선택"
        );
    }

    return {
        style,
        description:
            makeAIComment(
                stats,
                style
            ),
        tags,
        strengths,
        weaknesses
    };
}


/* =========================================================
   11. AI 코치 한줄평
========================================================= */

function makeAIComment(
    stats,
    style
) {

    if (!stats.games) {

        return "경기 데이터가 쌓이면 AI 코치 분석이 생성됩니다.";
    }

    const ppg =
        stats.points /
        stats.games;

    const apg =
        stats.assists /
        stats.games;

    const fg =
        getFGPercent(stats);

    const tpg =
        stats.turnovers /
        stats.games;

    if (
        ppg >= 10 &&
        fg >= 50
    ) {

        return "득점 효율이 매우 좋습니다. 현재 공격 생산성을 유지하면서 수비 기여도를 더 끌어올리면 완성도가 높아집니다.";
    }

    if (
        apg >= 3 &&
        tpg <= 2
    ) {

        return "경기를 읽고 동료를 살리는 능력이 강점입니다. 다음 단계는 압박 상황에서 직접 득점까지 연결하는 것입니다.";
    }

    if (
        fg < 40 &&
        stats.fgAttempted >= 10
    ) {

        return "현재 가장 큰 개선 포인트는 슛 선택과 효율입니다. 가까운 거리에서 성공률을 먼저 안정화하는 것을 추천합니다.";
    }

    if (
        tpg >= 3
    ) {

        return "공격 적극성은 좋지만 턴오버 관리가 다음 성장 포인트입니다. 첫 드리블과 패스 타이밍을 단순화해보세요.";
    }

    return `${style} 성향이 뚜렷합니다. 공격·수비·의사결정 데이터를 함께 쌓으면 더 정교한 선수 프로파일을 만들 수 있습니다.`;
}


/* =========================================================
   12. 훈련 추천
========================================================= */

function getTrainingRecommendations(stats) {

    if (!stats.games) {

        return [
            {
                priority: "DATA",
                title: "경기 데이터 수집",
                description:
                    "실제 경기 기록을 먼저 입력하면 선수별 약점을 자동으로 찾을 수 있습니다.",
                drill:
                    "3x3 경기 기록 → 슛 위치 → 턴오버 → 리바운드 기록"
            }
        ];
    }

    const result = [];

    const fg =
        getFGPercent(stats);

    const three =
        getThreePercent(stats);

    const tpg =
        stats.turnovers /
        stats.games;

    const apg =
        stats.assists /
        stats.games;

    const rpg =
        stats.rebounds /
        stats.games;

    if (fg < 40) {

        result.push({
            priority: "HIGH",
            title: "야투 효율 개선",
            description:
                "무리한 슛보다 높은 확률의 슛을 만드는 것이 우선입니다.",
            drill:
                "근거리 폼슛 → 미드레인지 → 수비 붙은 캐치앤슛"
        });
    }

    if (three < 33) {

        result.push({
            priority: "HIGH",
            title: "3점 슈팅",
            description:
                "3x3에서는 외곽 공간을 활용하는 능력이 중요합니다.",
            drill:
                "5지점 캐치앤슛 5세트 + 이동 후 슛"
        });
    }

    if (tpg >= 3) {

        result.push({
            priority: "HIGH",
            title: "턴오버 감소",
            description:
                "첫 드리블과 패스 선택을 안정화하는 훈련이 필요합니다.",
            drill:
                "1대1 압박 탈출 → 2대1 패싱 → 제한 드리블"
        });
    }

    if (apg < 1.5) {

        result.push({
            priority: "MED",
            title: "패싱·의사결정",
            description:
                "수비를 끌어낸 뒤 동료에게 연결하는 능력을 강화합니다.",
            drill:
                "2대1 읽기 → 킥아웃 → 컷인 패스"
        });
    }

    if (rpg < 4) {

        result.push({
            priority: "MED",
            title: "리바운드",
            description:
                "공의 궤적을 읽고 먼저 자리를 확보하는 훈련입니다.",
            drill:
                "박스아웃 → 추적 리바운드 → 아웃렛 패스"
        });
    }

    if (!result.length) {

        result.push({
            priority: "MAINTAIN",
            title: "현재 강점 유지",
            description:
                "전체적으로 안정적인 지표입니다.",
            drill:
                "실전 3x3에서 강점 상황 반복"
        });
    }

    return result;
}


/* =========================================================
   13. 대시보드
========================================================= */

function renderDashboard() {

    const games =
        data.games;

    const wins =
        games.filter(
            g => g.result === "W"
        ).length;

    const losses =
        games.filter(
            g => g.result === "L"
        ).length;

    const totalPoints =
        games.reduce(
            (sum, game) =>
                sum + (
                    game.teamScore || 0
                ),
            0
        );

    setText(
        "#dashboardGames",
        games.length
    );

    setText(
        "#dashboardWins",
        wins
    );

    setText(
        "#dashboardLosses",
        losses
    );

    setText(
        "#dashboardPoints",
        totalPoints
    );

    renderRecentGames();
    renderDashboardPlayers();
    renderDashboardCoach();
}


function setText(
    selector,
    value
) {

    const element =
        $(selector);

    if (element) {
        element.textContent =
            value;
    }
}


function renderRecentGames() {

    const container =
        $("#recentGames");

    if (!container) return;

    const games =
        [...data.games]
            .reverse()
            .slice(0, 6);

    if (!games.length) {

        container.innerHTML =
            `<div class="empty-state">
                아직 경기 기록이 없습니다.
            </div>`;

        return;
    }

    container.innerHTML =
        games.map(
            game => `
            <div class="game-row">
                <div>
                    <div class="game-opponent">
                        ${escapeHTML(game.opponent)}
                    </div>
                    <div class="game-date">
                        ${escapeHTML(game.date)}
                    </div>
                </div>

                <div class="game-score">
                    ${game.teamScore} - ${game.opponentScore}
                </div>

                <div class="game-result ${game.result === "W" ? "win" : "loss"}">
                    ${game.result}
                </div>
            </div>
            `
        ).join("");
}


function renderDashboardPlayers() {

    const container =
        $("#dashboardPlayers");

    if (!container) return;

    const ranked =
        data.players
            .map(
                player => ({
                    player,
                    stats:
                        getPlayerStats(
                            player.id
                        )
                })
            )
            .sort(
                (a, b) =>
                    calculatePlayerRating(
                        b.stats
                    ) -
                    calculatePlayerRating(
                        a.stats
                    )
            )
            .slice(0, 5);

    container.innerHTML =
        ranked.map(
            ({ player, stats }) => {

                const rating =
                    calculatePlayerRating(
                        stats
                    );

                return `
                    <div class="player-report-card">
                        <div class="player-report-card-header">
                            <div class="player-report-name">
                                <span class="player-number">
                                    #${player.number}
                                </span>
                                <strong>
                                    ${escapeHTML(player.name)}
                                </strong>
                            </div>

                            <span class="player-rating">
                                ${rating}
                            </span>
                        </div>

                        <div class="player-stat-mini">
                            <div>
                                <span>PTS</span>
                                <strong>${stats.points}</strong>
                            </div>

                            <div>
                                <span>REB</span>
                                <strong>${stats.rebounds}</strong>
                            </div>

                            <div>
                                <span>AST</span>
                                <strong>${stats.assists}</strong>
                            </div>

                            <div>
                                <span>FG%</span>
                                <strong>
                                    ${getFGPercent(stats).toFixed(1)}
                                </strong>
                            </div>
                        </div>
                    </div>
                `;
            }
        ).join("");
}


function renderDashboardCoach() {

    const container =
        $("#dashboardCoach");

    if (!container) return;

    const allStats =
        combineAllPlayerStats();

    const comment =
        makeAIComment(
            allStats,
            "팀"
        );

    container.innerHTML =
        `
        <div class="ai-coach">
            <div class="ai-icon">
                AI
            </div>

            <div>
                <p>
                    ${escapeHTML(comment)}
                </p>

                <div class="coach-tags">
                    <span>3X3</span>
                    <span>TEAM ANALYSIS</span>
                    <span>AI COACH</span>
                </div>
            </div>
        </div>
        `;
}


/* =========================================================
   14. 전체 선수 통계
========================================================= */

function combineAllPlayerStats() {

    const result = {
        games: data.games.length,

        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fouls: 0,

        fgMade: 0,
        fgAttempted: 0,

        threeMade: 0,
        threeAttempted: 0,

        ftMade: 0,
        ftAttempted: 0,

        plusMinus: 0,

        shots: []
    };

    data.players.forEach(
        player => {

            const stats =
                getPlayerStats(
                    player.id
                );

            Object.keys(result)
                .forEach(key => {

                    if (
                        typeof result[key] === "number" &&
                        typeof stats[key] === "number"
                    ) {

                        result[key] +=
                            stats[key];
                    }
                });

            result.shots.push(
                ...stats.shots
            );
        }
    );

    return result;
}


/* =========================================================
   15. 경기 생성
========================================================= */

function createNewGame() {

    data.currentGame = {
        id: uid("game"),

        date:
            formatDate(),

        opponent:
            "상대팀",

        teamName:
            "설천고",

        teamScore: 0,

        opponentScore: 0,

        result: "W",

        timeRemaining:
            data.settings.gameMinutes * 60,

        running: false,

        events: [],

        players: {},

        shots: []
    };

    data.players.forEach(
        player => {

            data.currentGame.players[
                player.id
            ] = {
                points: 0,
                rebounds: 0,
                assists: 0,
                steals: 0,
                blocks: 0,

                turnovers: 0,
                fouls: 0,

                fgMade: 0,
                fgAttempted: 0,

                twoMade: 0,
                twoAttempted: 0,

                threeMade: 0,
                threeAttempted: 0,

                ftMade: 0,
                ftAttempted: 0,

                plusMinus: 0,

                minutes: 0,

                shots: []
            };
        }
    );

    saveData();

    showToast(
        "새로운 15분 3x3 경기를 시작했습니다."
    );

    navigate("game");
}


/* =========================================================
   16. 경기 이벤트
========================================================= */

function recordEvent(
    playerId,
    eventType,
    value = 1
) {

    const game =
        data.currentGame;

    if (!game) {

        showToast(
            "먼저 경기를 시작해주세요."
        );

        return;
    }

    const player =
        game.players[playerId];

    if (!player) return;

    const playerInfo =
        data.players.find(
            p => p.id === playerId
        );

    const event = {
        id: uid("event"),

        time:
            formatGameTime(
                game.timeRemaining
            ),

        playerId,

        playerName:
            playerInfo?.name ||
            "선수",

        type:
            eventType,

        value
    };

    switch (eventType) {

        case "2PM":

            player.points += 2;

            player.fgMade++;
            player.fgAttempted++;

            player.twoMade++;
            player.twoAttempted++;

            game.teamScore += 2;

            addShot(
                playerId,
                true,
                2
            );

            break;


        case "2PA_MISS":

            player.fgAttempted++;

            player.twoAttempted++;

            addShot(
                playerId,
                false,
                2
            );

            break;


        case "3PM":

            player.points += 3;

            player.fgMade++;
            player.fgAttempted++;

            player.threeMade++;
            player.threeAttempted++;

            game.teamScore += 3;

            addShot(
                playerId,
                true,
                3
            );

            break;


        case "3PA_MISS":

            player.fgAttempted++;

            player.threeAttempted++;

            addShot(
                playerId,
                false,
                3
            );

            break;


        case "FTM":

            player.points += 1;

            player.ftMade++;
            player.ftAttempted++;

            game.teamScore += 1;

            break;


        case "FTA_MISS":

            player.ftAttempted++;

            break;


        case "REB":

            player.rebounds++;

            break;


        case "AST":

            player.assists++;

            break;


        case "STL":

            player.steals++;

            break;


        case "BLK":

            player.blocks++;

            break;


        case "TO":

            player.turnovers++;

            break;


        case "FOUL":

            player.fouls++;

            break;
    }

    game.events.push(
        event
    );

    updateGameResult();

    saveData();

    renderGame();
}


function addShot(
    playerId,
    made,
    points,
    x = null,
    y = null
) {

    const game =
        data.currentGame;

    if (!game) return;

    const shot = {

        id: uid("shot"),

        playerId,

        made,

        points,

        x:
            x ??
            Math.random() * 100,

        y:
            y ??
            Math.random() * 100,

        timestamp:
            Date.now()
    };

    game.shots.push(
        shot
    );

    game.players[
        playerId
    ].shots.push(
        shot
    );
}


function formatGameTime(
    seconds
) {

    const safe =
        Math.max(
            0,
            seconds
        );

    const minutes =
        Math.floor(
            safe / 60
        );

    const secs =
        Math.floor(
            safe % 60
        );

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


function updateGameResult() {

    const game =
        data.currentGame;

    if (!game) return;

    game.result =
        game.teamScore >=
        game.opponentScore
            ? "W"
            : "L";
}


/* =========================================================
   17. 경기 타이머
========================================================= */

let gameTimer = null;


function startGameTimer() {

    const game =
        data.currentGame;

    if (!game) return;

    if (game.running) return;

    game.running = true;

    gameTimer =
        setInterval(
            () => {

                if (
                    !data.currentGame
                ) {

                    stopGameTimer();

                    return;
                }

                game.timeRemaining--;

                if (
                    game.timeRemaining <= 0
                ) {

                    game.timeRemaining = 0;

                    stopGameTimer();

                    finishCurrentGame();

                    return;
                }

                renderGameClock();

            },
            1000
        );
}


function stopGameTimer() {

    if (gameTimer) {

        clearInterval(
            gameTimer
        );

        gameTimer = null;
    }

    if (data.currentGame) {

        data.currentGame.running =
            false;
    }
}


/* =========================================================
   18. 경기 종료
========================================================= */

function finishCurrentGame() {

    const game =
        data.currentGame;

    if (!game) return;

    stopGameTimer();

    updateGameResult();

    game.date =
        formatDate();

    data.games.push(
        structuredClone(game)
    );

    updateLeagueFromGame(
        game
    );

    data.currentGame = null;

    saveData();

    showToast(
        "경기가 종료되었습니다. 리포트를 생성했습니다."
    );

    navigate("report");
}


/* =========================================================
   19. 리그 순위 업데이트
========================================================= */

function updateLeagueFromGame(
    game
) {

    const team =
        data.teams.find(
            t =>
                t.name ===
                game.teamName
        ) ||
        data.teams[0];

    if (!team) return;

    team.played++;

    team.pointsFor +=
        game.teamScore;

    team.pointsAgainst +=
        game.opponentScore;

    if (
        game.teamScore >
        game.opponentScore
    ) {

        team.wins++;

    } else {

        team.losses++;
    }
}


/* =========================================================
   20. 경기 화면
========================================================= */

function renderGame() {

    const game =
        data.currentGame;

    if (!game) {

        setText(
            "#gameEmpty",
            "현재 진행 중인 경기가 없습니다."
        );

        return;
    }

    setText(
        "#gameTeamScore",
        game.teamScore
    );

    setText(
        "#gameOpponentScore",
        game.opponentScore
    );

    setText(
        "#gameClock",
        formatGameTime(
            game.timeRemaining
        )
    );

    const opponentInput =
        $("#opponentName");

    if (opponentInput) {

        opponentInput.value =
            game.opponent;
    }

    renderPlayerEventCards();
    renderEventLog();
}


function renderGameClock() {

    const game =
        data.currentGame;

    if (!game) return;

    setText(
        "#gameClock",
        formatGameTime(
            game.timeRemaining
        )
    );
}


function renderPlayerEventCards() {

    const container =
        $("#playerEventGrid");

    if (!container) return;

    container.innerHTML =
        data.players
            .map(
                player => {

                    const stats =
                        data.currentGame
                            ?.players[
                                player.id
                            ];

                    if (!stats) return "";

                    return `
                        <div class="event-player-card">

                            <div class="player-mini">
                                <strong>
                                    #${player.number}
                                </strong>

                                <span>
                                    ${escapeHTML(player.name)}
                                </span>
                            </div>

                            <div class="event-buttons">

                                <button
                                    data-event="2PM"
                                    data-player="${player.id}">
                                    2P+
                                </button>

                                <button
                                    data-event="2PA_MISS"
                                    data-player="${player.id}">
                                    2P-
                                </button>

                                <button
                                    data-event="3PM"
                                    data-player="${player.id}">
                                    3P+
                                </button>

                                <button
                                    data-event="3PA_MISS"
                                    data-player="${player.id}">
                                    3P-
                                </button>

                                <button
                                    data-event="FTM"
                                    data-player="${player.id}">
                                    FT+
                                </button>

                                <button
                                    data-event="REB"
                                    data-player="${player.id}">
                                    REB
                                </button>

                                <button
                                    data-event="AST"
                                    data-player="${player.id}">
                                    AST
                                </button>

                                <button
                                    data-event="STL"
                                    data-player="${player.id}">
                                    STL
                                </button>

                                <button
                                    data-event="BLK"
                                    data-player="${player.id}">
                                    BLK
                                </button>

                                <button
                                    data-event="TO"
                                    data-player="${player.id}">
                                    TO
                                </button>

                                <button
                                    data-event="FOUL"
                                    data-player="${player.id}">
                                    F
                                </button>

                            </div>

                        </div>
                    `;
                }
            ).join("");
}


function renderEventLog() {

    const container =
        $("#eventLog");

    if (!container) return;

    const events =
        data.currentGame?.events ||
        [];

    if (!events.length) {

        container.innerHTML =
            `<div class="empty-state">
                아직 기록된 이벤트가 없습니다.
            </div>`;

        return;
    }

    container.innerHTML =
        [...events]
            .reverse()
            .map(
                event => `
                    <div class="event-item">

                        <div class="event-time">
                            ${event.time}
                        </div>

                        <div class="event-description">
                            #${escapeHTML(event.playerName)}
                            ·
                            ${eventTypeLabel(event.type)}
                        </div>

                        <div class="event-value">
                            ${eventValueLabel(event)}
                        </div>

                    </div>
                `
            ).join("");
}


function eventTypeLabel(type) {

    const labels = {

        "2PM": "2점 성공",
        "2PA_MISS": "2점 실패",

        "3PM": "3점 성공",
        "3PA_MISS": "3점 실패",

        "FTM": "자유투 성공",
        "FTA_MISS": "자유투 실패",

        "REB": "리바운드",
        "AST": "어시스트",
        "STL": "스틸",
        "BLK": "블록",

        "TO": "턴오버",
        "FOUL": "파울"
    };

    return (
        labels[type] ||
        type
    );
}


function eventValueLabel(event) {

    if (
        event.type === "2PM"
    ) return "+2";

    if (
        event.type === "3PM"
    ) return "+3";

    if (
        event.type === "FTM"
    ) return "+1";

    return "";
}


/* =========================================================
   21. 분석 페이지
========================================================= */

function renderAnalysis() {

    const playerId =
        data.selectedPlayerId ||
        data.players[0]?.id;

    if (!playerId) return;

    const player =
        data.players.find(
            p =>
                p.id === playerId
        );

    if (!player) return;

    const stats =
        getPlayerStats(
            playerId
        );

    const rating =
        calculatePlayerRating(
            stats
        );

    const style =
        analyzePlayerStyle(
            stats
        );

    setText(
        "#analysisPlayerName",
        player.name
    );

    setText(
        "#analysisRating",
        rating
    );

    setText(
        "#analysisPTS",
        stats.points
    );

    setText(
        "#analysisREB",
        stats.rebounds
    );

    setText(
        "#analysisAST",
        stats.assists
    );

    setText(
        "#analysisSTL",
        stats.steals
    );

    setText(
        "#analysisFG",
        getFGPercent(stats).toFixed(1) + "%"
    );

    setText(
        "#analysis3P",
        getThreePercent(stats).toFixed(1) + "%"
    );

    renderStyleAnalysis(
        style
    );

    renderPlayerHeatmap(
        playerId
    );

    renderTrainingForPlayer(
        stats
    );
}


function renderStyleAnalysis(
    style
) {

    const container =
        $("#styleAnalysis");

    if (!container) return;

    container.innerHTML = `
        <div class="ai-coach">

            <div class="ai-icon">
                AI
            </div>

            <div>

                <p>
                    ${escapeHTML(
                        style.description
                    )}
                </p>

                <div class="coach-tags">

                    ${style.tags
                        .map(
                            tag =>
                                `<span>${escapeHTML(tag)}</span>`
                        )
                        .join("")}

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   22. 히트맵
========================================================= */

function renderPlayerHeatmap(
    playerId
) {

    const court =
        $("#analysisCourt");

    if (!court) return;

    court.innerHTML = `
        <div class="court-center"></div>
        <div class="court-paint"></div>
        <div class="court-free-throw"></div>
        <div class="court-three"></div>
        <div class="court-hoop"></div>
    `;

    const stats =
        getPlayerStats(
            playerId
        );

    const filter =
        data.heatmapFilter ||
        "all";

    const shots =
        stats.shots.filter(
            shot => {

                if (
                    filter === "made"
                ) {

                    return shot.made;
                }

                if (
                    filter === "miss"
                ) {

                    return !shot.made;
                }

                return true;
            }
        );

    shots.forEach(
        shot => {

            const dot =
                document.createElement(
                    "div"
                );

            dot.className =
                "shot-dot " +
                (
                    shot.made
                        ? "made"
                        : "miss"
                );

            dot.style.left =
                `${clamp(
                    shot.x,
                    2,
                    98
                )}%`;

            dot.style.top =
                `${clamp(
                    shot.y,
                    3,
                    97
                )}%`;

            dot.title =
                shot.made
                    ? `${shot.points}점 성공`
                    : `${shot.points}점 실패`;

            court.appendChild(
                dot
            );
        }
    );

    const made =
        shots.filter(
            s => s.made
        ).length;

    const attempted =
        shots.length;

    setText(
        "#heatmapAttempts",
        attempted
    );

    setText(
        "#heatmapMade",
        made
    );

    setText(
        "#heatmapPercent",
        attempted
            ? (
                made /
                attempted *
                100
            ).toFixed(1) + "%"
            : "0%"
    );
}


/* =========================================================
   23. 리포트
========================================================= */

function renderReport() {

    const game =
        data.games[
            data.games.length - 1
        ];

    if (!game) {

        renderEmptyReport();

        return;
    }

    setText(
        "#reportScore",
        `${game.teamScore} - ${game.opponentScore}`
    );

    setText(
        "#reportOpponent",
        game.opponent
    );

    const mvp =
        findGameMVP(
            game
        );

    if (mvp) {

        setText(
            "#reportMVP",
            mvp.player.name
        );

        setText(
            "#reportMVPScore",
            `${mvp.stats.points} PTS · ${mvp.rating} RATING`
        );
    }

    renderReportPlayers(
        game
    );

    renderReportHeatmap(
        game
    );

    renderGameAIReport(
        game
    );
}


function renderEmptyReport() {

    setText(
        "#reportScore",
        "—"
    );

    setText(
        "#reportOpponent",
        "아직 경기 없음"
    );

    setText(
        "#reportMVP",
        "—"
    );

    setText(
        "#reportMVPScore",
        "경기 종료 후 자동 생성"
    );
}


function findGameMVP(
    game
) {

    let best = null;

    Object.entries(
        game.players || {}
    ).forEach(
        ([playerId, stats]) => {

            const player =
                data.players.find(
                    p =>
                        p.id === playerId
                );

            if (!player) return;

            const rating =
                calculatePlayerRating({
                    ...stats,
                    games: 1
                });

            if (
                !best ||
                rating > best.rating
            ) {

                best = {
                    player,
                    stats,
                    rating
                };
            }
        }
    );

    return best;
}


function renderReportPlayers(
    game
) {

    const container =
        $("#reportPlayers");

    if (!container) return;

    const rows =
        Object.entries(
            game.players || {}
        );

    container.innerHTML =
        rows.map(
            ([playerId, stats]) => {

                const player =
                    data.players.find(
                        p =>
                            p.id === playerId
                    );

                if (!player) return "";

                return `
                    <div class="player-report-card">

                        <div class="player-report-card-header">

                            <div class="player-report-name">
                                <span class="player-number">
                                    #${player.number}
                                </span>

                                <strong>
                                    ${escapeHTML(player.name)}
                                </strong>
                            </div>

                            <span class="player-rating">
                                ${calculatePlayerRating({
                                    ...stats,
                                    games: 1
                                })}
                            </span>

                        </div>

                        <div class="player-stat-mini">

                            <div>
                                <span>PTS</span>
                                <strong>${stats.points}</strong>
                            </div>

                            <div>
                                <span>REB</span>
                                <strong>${stats.rebounds}</strong>
                            </div>

                            <div>
                                <span>AST</span>
                                <strong>${stats.assists}</strong>
                            </div>

                            <div>
                                <span>TO</span>
                                <strong>${stats.turnovers}</strong>
                            </div>

                        </div>

                    </div>
                `;
            }
        ).join("");
}


function renderReportHeatmap(
    game
) {

    const court =
        $("#reportCourt");

    if (!court) return;

    court.innerHTML = `
        <div class="court-center"></div>
        <div class="court-paint"></div>
        <div class="court-free-throw"></div>
        <div class="court-three"></div>
        <div class="court-hoop"></div>
    `;

    (
        game.shots || []
    ).forEach(
        shot => {

            const dot =
                document.createElement(
                    "div"
                );

            dot.className =
                "shot-dot " +
                (
                    shot.made
                        ? "made"
                        : "miss"
                );

            dot.style.left =
                `${shot.x}%`;

            dot.style.top =
                `${shot.y}%`;

            court.appendChild(
                dot
            );
        }
    );
}


function renderGameAIReport(
    game
) {

    const container =
        $("#gameAIReport");

    if (!container) return;

    const teamStats =
        Object.values(
            game.players || {}
        ).reduce(
            (total, stats) => {

                total.points +=
                    stats.points || 0;

                total.rebounds +=
                    stats.rebounds || 0;

                total.assists +=
                    stats.assists || 0;

                total.turnovers +=
                    stats.turnovers || 0;

                total.fgMade +=
                    stats.fgMade || 0;

                total.fgAttempted +=
                    stats.fgAttempted || 0;

                return total;

            },
            {
                points: 0,
                rebounds: 0,
                assists: 0,
                turnovers: 0,
                fgMade: 0,
                fgAttempted: 0
            }
        );

    const comment =
        makeAIComment(
            {
                ...teamStats,
                games: 1
            },
            "3x3 팀"
        );

    const training =
        getTrainingRecommendations({
            ...teamStats,
            games: 1
        });

    container.innerHTML = `
        <div class="ai-report-text">
            ${escapeHTML(comment)}
        </div>

        <div class="recommendation-box">

            <h4>
                다음 경기 추천
            </h4>

            <ul>
                ${training
                    .slice(0, 3)
                    .map(
                        item =>
                            `<li>
                                ${escapeHTML(item.title)}
                            </li>`
                    )
                    .join("")}
            </ul>

        </div>
    `;
}


/* =========================================================
   24. 선수 관리
========================================================= */

function renderPlayers() {

    const container =
        $("#playerGrid");

    if (!container) return;

    container.innerHTML =
        data.players.map(
            player => {

                const stats =
                    getPlayerStats(
                        player.id
                    );

                const rating =
                    calculatePlayerRating(
                        stats
                    );

                return `
                    <div
                        class="player-card ${
                            data.selectedPlayerId === player.id
                                ? "selected"
                                : ""
                        }"
                        data-player-card="${player.id}"
                    >

                        <div class="player-card-top">

                            <div>
                                <div class="jersey-number">
                                    #${player.number}
                                </div>

                                <h3>
                                    ${escapeHTML(player.name)}
                                </h3>

                                <p>
                                    ${escapeHTML(player.position)}
                                </p>
                            </div>

                            <div class="player-card-rating">
                                <span>RATING</span>
                                <strong>${rating}</strong>
                            </div>

                        </div>

                        <div class="player-card-stats">

                            <div>
                                <span>PTS</span>
                                <strong>${stats.points}</strong>
                            </div>

                            <div>
                                <span>REB</span>
                                <strong>${stats.rebounds}</strong>
                            </div>

                            <div>
                                <span>AST</span>
                                <strong>${stats.assists}</strong>
                            </div>

                            <div>
                                <span>FG%</span>
                                <strong>
                                    ${getFGPercent(stats).toFixed(0)}
                                </strong>
                            </div>

                        </div>

                    </div>
                `;
            }
        ).join("");

    renderSelectedPlayer();
}


function renderSelectedPlayer() {

    const player =
        data.players.find(
            p =>
                p.id ===
                data.selectedPlayerId
        );

    if (!player) return;

    const stats =
        getPlayerStats(
            player.id
        );

    setText(
        "#detailPlayerName",
        player.name
    );

    setText(
        "#detailPlayerNumber",
        `#${player.number}`
    );

    setText(
        "#detailRating",
        calculatePlayerRating(
            stats
        )
    );

    setText(
        "#detailPTS",
        stats.points
    );

    setText(
        "#detailREB",
        stats.rebounds
    );

    setText(
        "#detailAST",
        stats.assists
    );

    setText(
        "#detailSTL",
        stats.steals
    );

    setText(
        "#detailFG",
        getFGPercent(stats).toFixed(1) + "%"
    );

    setText(
        "#detail3P",
        getThreePercent(stats).toFixed(1) + "%"
    );

    setText(
        "#detailTO",
        stats.turnovers
    );

    setText(
        "#detailGames",
        stats.games
    );
}


/* =========================================================
   25. 리그 순위
========================================================= */

function renderLeague() {

    const container =
        $("#leagueTableBody");

    if (!container) return;

    const sorted =
        [...data.teams]
            .sort(
                (a, b) => {

                    const winA =
                        a.played
                            ? a.wins /
                              a.played
                            : 0;

                    const winB =
                        b.played
                            ? b.wins /
                              b.played
                            : 0;

                    if (
                        winB !== winA
                    ) {

                        return winB - winA;
                    }

                    return (
                        b.pointsFor -
                        b.pointsAgainst
                    ) -
                    (
                        a.pointsFor -
                        a.pointsAgainst
                    );
                }
            );

    container.innerHTML =
        sorted.map(
            (team, index) => {

                const winRate =
                    team.played
                        ? (
                            team.wins /
                            team.played *
                            100
                        ).toFixed(1)
                        : "0.0";

                const diff =
                    team.pointsFor -
                    team.pointsAgainst;

                return `
                    <tr>

                        <td>
                            <span class="rank-number">
                                ${index + 1}
                            </span>
                        </td>

                        <td>
                            <span class="team-name">
                                ${escapeHTML(team.name)}
                            </span>
                        </td>

                        <td>
                            ${team.played}
                        </td>

                        <td>
                            <span class="win-text">
                                ${team.wins}
                            </span>
                        </td>

                        <td>
                            <span class="loss-text">
                                ${team.losses}
                            </span>
                        </td>

                        <td>
                            ${winRate}%
                        </td>

                        <td>
                            ${team.pointsFor}
                        </td>

                        <td>
                            ${team.pointsAgainst}
                        </td>

                        <td>
                            ${diff >= 0 ? "+" : ""}
                            ${diff}
                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* =========================================================
   26. 비디오 분석
========================================================= */

function renderVideoPage() {

    const pipeline =
        $("#videoPipeline");

    if (!pipeline) return;

    pipeline.innerHTML = `
        <div class="pipeline-step active">
            <strong>01</strong>
            <span>영상 업로드</span>
        </div>

        <div class="pipeline-step">
            <strong>02</strong>
            <span>프레임 분석</span>
        </div>

        <div class="pipeline-step">
            <strong>03</strong>
            <span>선수 추적</span>
        </div>

        <div class="pipeline-step">
            <strong>04</strong>
            <span>이벤트 인식</span>
        </div>

        <div class="pipeline-step">
            <strong>05</strong>
            <span>리포트 생성</span>
        </div>
    `;
}


function handleVideoFile(
    file
) {

    if (!file) return;

    const allowed =
        [
            "video/mp4",
            "video/webm",
            "video/quicktime"
        ];

    if (
        file.type &&
        !allowed.includes(file.type)
    ) {

        showToast(
            "MP4, WebM, MOV 영상만 사용할 수 있습니다."
        );

        return;
    }

    setText(
        "#videoFileName",
        file.name
    );

    const pipelineSteps =
        $$(".pipeline-step");

    pipelineSteps.forEach(
        (step, index) => {

            step.classList.remove(
                "active",
                "done"
            );

            if (index === 0) {
                step.classList.add("done");
            }
        }
    );

    showToast(
        "영상이 등록되었습니다. 영상 AI 분석 모듈을 연결할 수 있습니다."
    );
}


/* =========================================================
   27. 훈련 페이지
========================================================= */

function renderTraining() {

    const playerId =
        data.selectedPlayerId;

    if (!playerId) return;

    const stats =
        getPlayerStats(
            playerId
        );

    renderTrainingForPlayer(
        stats
    );
}


function renderTrainingForPlayer(
    stats
) {

    const container =
        $("#trainingGrid");

    if (!container) return;

    const recommendations =
        getTrainingRecommendations(
            stats
        );

    container.innerHTML =
        recommendations.map(
            item => `
                <div class="training-card">

                    <span class="training-priority">
                        ${escapeHTML(item.priority)}
                    </span>

                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>

                    <p>
                        ${escapeHTML(item.description)}
                    </p>

                    <div class="training-drill">
                        <strong>
                            DRILL
                        </strong>

                        <br>

                        ${escapeHTML(item.drill)}
                    </div>

                </div>
            `
        ).join("");
}


/* =========================================================
   28. 데이터 관리
========================================================= */

function renderDataPage() {

    setText(
        "#dataGames",
        data.games.length
    );

    setText(
        "#dataPlayers",
        data.players.length
    );

    setText(
        "#dataTeams",
        data.teams.length
    );
}


function exportData() {

    const json =
        JSON.stringify(
            data,
            null,
            2
        );

    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        `seolcheon-basketball-backup-${Date.now()}.json`;

    link.click();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "백업 파일을 저장했습니다."
    );
}


function importDataFile(
    file
) {

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        event => {

            try {

                const imported =
                    JSON.parse(
                        event.target.result
                    );

                if (
                    !imported ||
                    typeof imported !==
                    "object"
                ) {

                    throw new Error(
                        "잘못된 데이터"
                    );
                }

                data = {
                    ...structuredClone(
                        DEFAULT_DATA
                    ),
                    ...imported
                };

                saveData();

                showToast(
                    "데이터를 복구했습니다."
                );

                navigate(
                    "dashboard"
                );

            } catch (error) {

                console.error(
                    error
                );

                showToast(
                    "백업 파일을 읽을 수 없습니다."
                );
            }
        };

    reader.readAsText(
        file
    );
}


function resetAllData() {

    const confirmed =
        confirm(
            "모든 경기·선수·리그 데이터를 삭제할까요?"
        );

    if (!confirmed) return;

    data =
        structuredClone(
            DEFAULT_DATA
        );

    saveData();

    showToast(
        "모든 데이터가 초기화되었습니다."
    );

    navigate(
        "dashboard"
    );
}


/* =========================================================
   29. 버튼 이벤트
========================================================= */

function initButtons() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );

            if (!button) return;


            /* 새 경기 */

            if (
                button.id ===
                "newGameButton"
            ) {

                createNewGame();

                return;
            }


            /* 경기 시작 */

            if (
                button.id ===
                "startGameButton"
            ) {

                startGameTimer();

                showToast(
                    "경기 타이머 시작"
                );

                return;
            }


            /* 경기 일시정지 */

            if (
                button.id ===
                "pauseGameButton"
            ) {

                stopGameTimer();

                showToast(
                    "경기를 일시정지했습니다."
                );

                return;
            }


            /* 경기 종료 */

            if (
                button.id ===
                "finishGameButton"
            ) {

                finishCurrentGame();

                return;
            }


            /* 이벤트 */

            if (
                button.dataset.event &&
                button.dataset.player
            ) {

                recordEvent(
                    button.dataset.player,
                    button.dataset.event
                );

                return;
            }


            /* 선수 선택 */

            if (
                button.dataset.playerCard
            ) {

                data.selectedPlayerId =
                    button.dataset.playerCard;

                saveData();

                renderPlayers();
                renderAnalysis();
                renderTraining();

                return;
            }


            /* 히트맵 필터 */

            if (
                button.dataset.heatmap
            ) {

                data.heatmapFilter =
                    button.dataset.heatmap;

                saveData();

                renderPlayerHeatmap(
                    data.selectedPlayerId
                );

                $$(".filter-buttons button")
                    .forEach(
                        btn => {

                            btn.classList.toggle(
                                "active",
                                btn.dataset.heatmap ===
                                data.heatmapFilter
                            );
                        }
                    );

                return;
            }


            /* 데이터 백업 */

            if (
                button.id ===
                "exportDataButton"
            ) {

                exportData();

                return;
            }


            /* 데이터 초기화 */

            if (
                button.id ===
                "resetDataButton"
            ) {

                resetAllData();

                return;
            }


            /* 리포트 인쇄 */

            if (
                button.id ===
                "printReportButton"
            ) {

                window.print();

                return;
            }

        }
    );
}


/* =========================================================
   30. 입력 이벤트
========================================================= */

function initInputs() {

    document.addEventListener(
        "input",
        event => {

            const input =
                event.target;

            if (
                input.id ===
                "opponentName"
            ) {

                if (
                    data.currentGame
                ) {

                    data.currentGame.opponent =
                        input.value;

                    saveData();
                }
            }
        }
    );
}


/* =========================================================
   31. 파일 업로드
========================================================= */

function initFileInputs() {

    const videoInput =
        $("#videoInput");

    if (videoInput) {

        videoInput.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];

                handleVideoFile(
                    file
                );
            }
        );
    }


    const backupInput =
        $("#backupInput");

    if (backupInput) {

        backupInput.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];

                importDataFile(
                    file
                );
            }
        );
    }
}


/* =========================================================
   32. 드래그 앤 드롭 영상
========================================================= */

function initVideoDrop() {

    const zone =
        $("#videoUploadZone");

    if (!zone) return;

    [
        "dragenter",
        "dragover"
    ].forEach(
        eventName => {

            zone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

                    zone.classList.add(
                        "dragover"
                    );
                }
            );
        }
    );


    [
        "dragleave",
        "drop"
    ].forEach(
        eventName => {

            zone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

                    zone.classList.remove(
                        "dragover"
                    );
                }
            );
        }
    );


    zone.addEventListener(
        "drop",
        event => {

            const file =
                event.dataTransfer
                    ?.files?.[0];

            handleVideoFile(
                file
            );
        }
    );
}


/* =========================================================
   33. 슛 위치 직접 입력
========================================================= */

function initCourtClick() {

    document.addEventListener(
        "click",
        event => {

            const court =
                event.target.closest(
                    "#analysisCourt"
                );

            if (!court) return;

            if (
                event.target.classList.contains(
                    "shot-dot"
                )
            ) {
                return;
            }

            const playerId =
                data.selectedPlayerId;

            if (!playerId) return;

            const rect =
                court.getBoundingClientRect();

            const x =
                (
                    (event.clientX -
                        rect.left) /
                    rect.width
                ) * 100;

            const y =
                (
                    (event.clientY -
                        rect.top) /
                    rect.height
                ) * 100;

            const made =
                confirm(
                    "이 위치의 슛을 성공으로 기록할까요?\n취소 = 실패"
                );

            const points =
                x > 70
                    ? 3
                    : 2;

            addManualShot(
                playerId,
                made,
                points,
                x,
                y
            );
        }
    );
}


function addManualShot(
    playerId,
    made,
    points,
    x,
    y
) {

    const player =
        data.currentGame
            ?.players?.[playerId];

    if (!player) {

        showToast(
            "진행 중인 경기에서만 직접 슛 위치를 입력할 수 있습니다."
        );

        return;
    }

    player.fgAttempted++;

    if (points === 3) {

        player.threeAttempted++;

    } else {

        player.twoAttempted++;
    }

    if (made) {

        player.fgMade++;

        player.points +=
            points;

        if (points === 3) {

            player.threeMade++;

        } else {

            player.twoMade++;
        }

        data.currentGame.teamScore +=
            points;
    }

    addShot(
        playerId,
        made,
        points,
        x,
        y
    );

    data.currentGame.events.push({
        id: uid("event"),
        time:
            formatGameTime(
                data.currentGame.timeRemaining
            ),
        playerId,
        playerName:
            data.players.find(
                p =>
                    p.id === playerId
            )?.name ||
            "선수",
        type:
            made
                ? `${points}P 위치슛 성공`
                : `${points}P 위치슛 실패`,
        value: points
    });

    updateGameResult();

    saveData();

    renderGame();
    renderPlayerHeatmap(
        playerId
    );

    showToast(
        "슛 위치가 기록되었습니다."
    );
}


/* =========================================================
   34. 초기화
========================================================= */

function init() {

    console.log(
        `${APP_NAME} 초기화`
    );

    initNavigation();

    initButtons();

    initInputs();

    initFileInputs();

    initVideoDrop();

    initCourtClick();

    renderDashboard();

    renderGame();

    renderAnalysis();

    renderPlayers();

    renderLeague();

    renderReport();

    renderVideoPage();

    renderTraining();

    renderDataPage();

    /*
     * 기본 페이지
     */

    navigate("dashboard");
}


/* =========================================================
   35. DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();
}


/* =========================================================
   36. 외부에서 사용할 수 있도록 공개
========================================================= */

window.SeolcheonBasketball = {

    data,

    saveData,

    createNewGame,

    finishCurrentGame,

    recordEvent,

    addShot,

    getPlayerStats,

    calculatePlayerRating,

    analyzePlayerStyle,

    getTrainingRecommendations,

    exportData,

    navigate
};


/* =========================================================
   END
========================================================= */