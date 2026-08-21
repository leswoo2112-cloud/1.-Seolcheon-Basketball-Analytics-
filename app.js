/* =========================================================
   SEOLCHEON HIGH SCHOOL
   3×3 PERFORMANCE LAB
   app.js

   핵심 기능
   ---------------------------------------------------------
   1. 페이지 이동
   2. 선수 관리
   3. 경기 관리
   4. 리그 순위
   5. 경기 리포트
   6. 선수 개인 리포트
   7. 슛 히트맵
   8. 영상 업로드
   9. AI 코치 분석
   10. AI 훈련 추천
   11. LocalStorage 저장
   ========================================================= */


/* =========================================================
   GLOBAL DATA
   ========================================================= */

const STORAGE_KEY = "seolcheon_3x3_performance_v1";

const DEFAULT_DATA = {
    settings: {
        school: "설천고",
        league: "설천고 3×3 리그",
        gameMinutes: 15
    },

    teams: [
        {
            id: "team-seolcheon",
            name: "설천고",
            short: "SCH",
            color: "#ff6b00"
        }
    ],

    players: [
        {
            id: "p1",
            number: 7,
            name: "김민준",
            position: "G",
            teamId: "team-seolcheon"
        },
        {
            id: "p2",
            number: 11,
            name: "이준호",
            position: "F",
            teamId: "team-seolcheon"
        },
        {
            id: "p3",
            number: 23,
            name: "박건우",
            position: "F",
            teamId: "team-seolcheon"
        }
    ],

    games: [],

    events: [],

    shots: [],

    video: {
        name: "",
        url: ""
    }
};


/* =========================================================
   STATE
   ========================================================= */

let state = loadData();

let currentPage = "dashboard";

let selectedPlayerId =
    state.players[0]?.id || null;

let selectedGameId =
    state.games[0]?.id || null;

let currentVideoUrl = null;


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeApp();

});


function initializeApp() {

    bindNavigation();

    bindButtons();

    bindForms();

    renderEverything();

    setupHeatmapCanvas();

    setupPlayerHeatmapCanvas();

    setupVideoUpload();

    window.addEventListener(
        "resize",
        () => {
            drawHeatmap();
            drawPlayerHeatmap();
        }
    );
}


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(DEFAULT_DATA);
        }

        const parsed = JSON.parse(saved);

        return {
            ...structuredClone(DEFAULT_DATA),
            ...parsed,

            settings: {
                ...DEFAULT_DATA.settings,
                ...(parsed.settings || {})
            },

            players:
                parsed.players ||
                DEFAULT_DATA.players,

            teams:
                parsed.teams ||
                DEFAULT_DATA.teams,

            games:
                parsed.games ||
                [],

            events:
                parsed.events ||
                [],

            shots:
                parsed.shots ||
                [],

            video:
                parsed.video ||
                DEFAULT_DATA.video
        };

    } catch (error) {

        console.error(
            "데이터 불러오기 실패:",
            error
        );

        return structuredClone(DEFAULT_DATA);
    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


/* =========================================================
   UTILITIES
   ========================================================= */

function uid(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


function el(id) {
    return document.getElementById(id);
}


function qs(selector) {
    return document.querySelector(selector);
}


function qsa(selector) {
    return [...document.querySelectorAll(selector)];
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatPercent(value) {

    if (!Number.isFinite(value)) {
        return "0%";
    }

    return `${Math.round(value)}%`;
}


function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );
}


function average(values) {

    if (!values.length) return 0;

    return values.reduce(
        (sum, value) => sum + value,
        0
    ) / values.length;
}


function showToast(message) {

    let toast = el("toast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function bindNavigation() {

    qsa(
        "[data-page], .nav-item"
    ).forEach(button => {

        button.addEventListener(
            "click",
            event => {

                const page =
                    button.dataset.page ||
                    button.getAttribute(
                        "data-target"
                    );

                if (!page) return;

                event.preventDefault();

                navigateTo(page);
            }
        );
    });
}


function navigateTo(page) {

    const pageId =
        page.startsWith("page-")
            ? page
            : `page-${page}`;

    const target =
        el(pageId);

    if (!target) {

        console.warn(
            "페이지를 찾을 수 없습니다:",
            pageId
        );

        return;
    }

    currentPage =
        pageId.replace(
            "page-",
            ""
        );

    qsa(".page").forEach(section => {

        section.classList.toggle(
            "active",
            section === target
        );
    });


    qsa(
        ".nav-item"
    ).forEach(item => {

        const targetPage =
            item.dataset.page ||
            item.dataset.target;

        item.classList.toggle(
            "active",
            targetPage === currentPage ||
            targetPage === pageId
        );
    });


    renderEverything();
}


/* =========================================================
   BUTTON BINDING
   ========================================================= */

function bindButtons() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) return;

            const action =
                button.dataset.action;

            handleAction(
                action,
                button
            );
        }
    );
}


function handleAction(action, button) {

    switch (action) {

        case "new-game":
            openGameModal();
            break;

        case "new-player":
            openPlayerModal();
            break;

        case "game-report":
            navigateTo("game-report");
            break;

        case "video-analysis":
            navigateTo("video-analysis");
            break;

        case "player-report":
            navigateTo("player-report");
            break;

        case "league":
            navigateTo("league");
            break;

        case "training":
            navigateTo("training");
            break;

        case "print-report":
            window.print();
            break;

        case "reset-data":
            resetAllData();
            break;

        case "add-shot":
            addManualShot();
            break;

        case "delete-player":
            deleteSelectedPlayer();
            break;

        case "delete-game":
            deleteSelectedGame();
            break;

        case "simulate-analysis":
            simulateVideoAnalysis();
            break;

        case "close-modal":
            closeAllModals();
            break;

        default:
            console.warn(
                "알 수 없는 action:",
                action
            );
    }
}


/* =========================================================
   FORMS
   ========================================================= */

function bindForms() {

    const gameForm =
        el("gameForm");

    if (gameForm) {

        gameForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                createGame(
                    new FormData(gameForm)
                );

                gameForm.reset();

                closeAllModals();
            }
        );
    }


    const playerForm =
        el("playerForm");

    if (playerForm) {

        playerForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                createPlayer(
                    new FormData(playerForm)
                );

                playerForm.reset();

                closeAllModals();
            }
        );
    }


    const shotForm =
        el("shotForm");

    if (shotForm) {

        shotForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const data =
                    new FormData(shotForm);

                addShot({

                    playerId:
                        data.get("playerId"),

                    x:
                        Number(
                            data.get("x")
                        ),

                    y:
                        Number(
                            data.get("y")
                        ),

                    made:
                        data.get("made") === "true",

                    points:
                        Number(
                            data.get("points") || 1
                        )
                });

                shotForm.reset();

                closeAllModals();
            }
        );
    }
}


/* =========================================================
   MODALS
   ========================================================= */

function openGameModal() {

    const modal =
        el("gameModal");

    if (!modal) return;

    modal.classList.add("open");

    populatePlayerSelects();
}


function openPlayerModal() {

    const modal =
        el("playerModal");

    if (!modal) return;

    modal.classList.add("open");
}


function closeAllModals() {

    qsa(".modal").forEach(
        modal =>
            modal.classList.remove(
                "open"
            )
    );
}


document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {
            event.target.classList.remove(
                "open"
            );
        }
    }
);


/* =========================================================
   PLAYER MANAGEMENT
   ========================================================= */

function createPlayer(formData) {

    const player = {

        id: uid("player"),

        number:
            Number(
                formData.get("number")
            ) || 0,

        name:
            String(
                formData.get("name") || "선수"
            ),

        position:
            String(
                formData.get("position") ||
                "G"
            ),

        teamId:
            String(
                formData.get("teamId") ||
                "team-seolcheon"
            )
    };


    state.players.push(player);

    selectedPlayerId =
        player.id;

    saveData();

    renderEverything();

    showToast(
        `${player.name} 선수가 등록되었습니다.`
    );
}


function deleteSelectedPlayer() {

    if (!selectedPlayerId) return;

    const player =
        getPlayer(
            selectedPlayerId
        );

    if (!player) return;

    const confirmed =
        confirm(
            `${player.name} 선수를 삭제할까요?`
        );

    if (!confirmed) return;

    state.players =
        state.players.filter(
            player =>
                player.id !==
                selectedPlayerId
        );

    state.events =
        state.events.filter(
            event =>
                event.playerId !==
                selectedPlayerId
        );

    state.shots =
        state.shots.filter(
            shot =>
                shot.playerId !==
                selectedPlayerId
        );

    selectedPlayerId =
        state.players[0]?.id ||
        null;

    saveData();

    renderEverything();

    showToast(
        "선수가 삭제되었습니다."
    );
}


function getPlayer(id) {

    return state.players.find(
        player =>
            player.id === id
    );
}


/* =========================================================
   GAME MANAGEMENT
   ========================================================= */

function createGame(formData) {

    const home =
        Number(
            formData.get("homeScore")
        ) || 0;

    const away =
        Number(
            formData.get("awayScore")
        ) || 0;


    const game = {

        id: uid("game"),

        date:
            formData.get("date") ||
            new Date()
                .toISOString()
                .slice(0, 10),

        opponent:
            String(
                formData.get(
                    "opponent"
                ) ||
                "상대팀"
            ),

        homeScore: home,

        awayScore: away,

        duration: 15,

        result:
            home > away
                ? "W"
                : home < away
                    ? "L"
                    : "D",

        playerStats: {},

        notes:
            String(
                formData.get(
                    "notes"
                ) || ""
            )
    };


    state.players.forEach(
        player => {

            game.playerStats[
                player.id
            ] = {

                pts: 0,
                reb: 0,
                ast: 0,
                stl: 0,
                blk: 0,
                tov: 0,

                fgm: 0,
                fga: 0,

                twoPM: 0,
                twoPA: 0,

                threePM: 0,
                threePA: 0
            };
        }
    );


    state.games.unshift(game);

    selectedGameId =
        game.id;

    saveData();

    renderEverything();

    showToast(
        "경기가 등록되었습니다."
    );
}


function deleteSelectedGame() {

    if (!selectedGameId) return;

    const game =
        getGame(
            selectedGameId
        );

    if (!game) return;

    if (
        !confirm(
            "선택한 경기를 삭제할까요?"
        )
    ) return;

    state.games =
        state.games.filter(
            item =>
                item.id !==
                selectedGameId
        );

    state.events =
        state.events.filter(
            event =>
                event.gameId !==
                selectedGameId
        );

    state.shots =
        state.shots.filter(
            shot =>
                shot.gameId !==
                selectedGameId
        );

    selectedGameId =
        state.games[0]?.id ||
        null;

    saveData();

    renderEverything();

    showToast(
        "경기가 삭제되었습니다."
    );
}


function getGame(id) {

    return state.games.find(
        game =>
            game.id === id
    );
}


/* =========================================================
   STAT EVENT
   ========================================================= */

function addEvent({
    gameId,
    playerId,
    type,
    value = 1,
    timestamp = 0
}) {

    state.events.push({

        id: uid("event"),

        gameId,

        playerId,

        type,

        value,

        timestamp
    });


    const game =
        getGame(gameId);

    if (!game) return;

    if (!game.playerStats[playerId]) {

        game.playerStats[playerId] = {

            pts: 0,
            reb: 0,
            ast: 0,
            stl: 0,
            blk: 0,
            tov: 0,

            fgm: 0,
            fga: 0,

            twoPM: 0,
            twoPA: 0,

            threePM: 0,
            threePA: 0
        };
    }


    const stats =
        game.playerStats[
            playerId
        ];


    switch (type) {

        case "PTS":
            stats.pts += value;
            break;

        case "REB":
            stats.reb += value;
            break;

        case "AST":
            stats.ast += value;
            break;

        case "STL":
            stats.stl += value;
            break;

        case "BLK":
            stats.blk += value;
            break;

        case "TOV":
            stats.tov += value;
            break;
    }
}


/* =========================================================
   SHOT DATA
   ========================================================= */

function addShot({

    gameId = selectedGameId,

    playerId = selectedPlayerId,

    x = 50,

    y = 50,

    made = false,

    points = 2

}) {

    if (!playerId) {

        showToast(
            "먼저 선수를 선택하세요."
        );

        return;
    }


    if (!gameId) {

        showToast(
            "먼저 경기를 선택하세요."
        );

        return;
    }


    x = clamp(
        Number(x),
        0,
        100
    );

    y = clamp(
        Number(y),
        0,
        100
    );


    const shot = {

        id: uid("shot"),

        gameId,

        playerId,

        x,

        y,

        made,

        points,

        createdAt:
            Date.now()
    };


    state.shots.push(shot);


    const game =
        getGame(gameId);

    if (game) {

        const stats =
            game.playerStats[playerId] ||
            createEmptyStats();

        stats.fga += 1;

        if (made) {

            stats.fgm += 1;

            stats.pts += points;
        }


        if (points === 3) {

            stats.threePA += 1;

            if (made) {
                stats.threePM += 1;
            }

        } else {

            stats.twoPA += 1;

            if (made) {
                stats.twoPM += 1;
            }
        }


        game.playerStats[playerId] =
            stats;
    }


    saveData();

    renderEverything();
}


function createEmptyStats() {

    return {

        pts: 0,
        reb: 0,
        ast: 0,
        stl: 0,
        blk: 0,
        tov: 0,

        fgm: 0,
        fga: 0,

        twoPM: 0,
        twoPA: 0,

        threePM: 0,
        threePA: 0
    };
}


function addManualShot() {

    if (!selectedGameId) {

        showToast(
            "먼저 경기를 등록하세요."
        );

        return;
    }


    const x =
        Math.random() * 90 + 5;

    const y =
        Math.random() * 90 + 5;

    const made =
        Math.random() > .45;

    const points =
        Math.random() > .72
            ? 3
            : 2;


    addShot({

        gameId:
            selectedGameId,

        playerId:
            selectedPlayerId,

        x,
        y,
        made,
        points
    });


    showToast(
        "슛 데이터가 추가되었습니다."
    );
}


/* =========================================================
   PLAYER STATS
   ========================================================= */

function getPlayerStats(
    playerId,
    gameId = null
) {

    const games =
        gameId
            ? state.games.filter(
                game =>
                    game.id ===
                    gameId
            )
            : state.games;


    const result =
        createEmptyStats();


    games.forEach(game => {

        const stats =
            game.playerStats?.[
                playerId
            ];

        if (!stats) return;

        Object.keys(result)
            .forEach(key => {

                result[key] +=
                    Number(
                        stats[key] || 0
                    );
            });
    });


    return result;
}


function getPlayerShots(
    playerId,
    gameId = null
) {

    return state.shots.filter(
        shot =>
            shot.playerId ===
            playerId &&
            (!gameId ||
                shot.gameId ===
                gameId)
    );
}


/* =========================================================
   TEAM STATS
   ========================================================= */

function getTeamStats(
    gameId
) {

    const game =
        getGame(gameId);

    if (!game) {

        return createEmptyStats();
    }


    const total =
        createEmptyStats();


    Object.values(
        game.playerStats || {}
    ).forEach(stats => {

        Object.keys(total)
            .forEach(key => {

                total[key] +=
                    Number(
                        stats[key] || 0
                    );
            });
    });


    return total;
}


/* =========================================================
   LEAGUE STANDINGS
   ========================================================= */

function getStandings() {

    const teams =
        state.teams.map(team => ({

            ...team,

            games: 0,
            wins: 0,
            losses: 0,
            draws: 0,

            pointsFor: 0,
            pointsAgainst: 0,

            winRate: 0
        }));


    state.games.forEach(game => {

        const team =
            teams.find(
                item =>
                    item.id ===
                    "team-seolcheon"
            );

        if (!team) return;


        team.games++;

        team.pointsFor +=
            game.homeScore;

        team.pointsAgainst +=
            game.awayScore;


        if (game.homeScore > game.awayScore) {

            team.wins++;

        } else if (
            game.homeScore <
            game.awayScore
        ) {

            team.losses++;

        } else {

            team.draws++;
        }
    });


    teams.forEach(team => {

        team.winRate =
            team.games
                ? (
                    team.wins /
                    team.games
                ) * 100
                : 0;

        team.diff =
            team.pointsFor -
            team.pointsAgainst;
    });


    teams.sort(
        (a, b) => {

            if (b.wins !== a.wins) {

                return b.wins -
                    a.wins;
            }

            return b.diff -
                a.diff;
        }
    );


    return teams;
}


/* =========================================================
   AI COACH
   ========================================================= */

function generatePlayerCoach(
    playerId
) {

    const stats =
        getPlayerStats(
            playerId
        );

    const shots =
        getPlayerShots(
            playerId
        );


    const fg =
        stats.fga
            ? stats.fgm /
              stats.fga
            : 0;


    const three =
        stats.threePA
            ? stats.threePM /
              stats.threePA
            : 0;


    const assistTurnover =
        stats.tov
            ? stats.ast /
              stats.tov
            : stats.ast;


    let style =
        "밸런스형";

    let comment =
        "공수 밸런스를 유지하면서 팀 플레이에 기여하는 유형입니다.";


    if (
        stats.pts >= 10 &&
        stats.fga >= 8
    ) {

        style =
            "스코어러";

        comment =
            "공격에서 가장 적극적으로 득점을 만들어내는 선수입니다.";

    } else if (
        stats.ast >= 4 &&
        assistTurnover >= 1.5
    ) {

        style =
            "플레이메이커";

        comment =
            "볼을 움직이고 동료의 득점 기회를 만들어주는 성향이 강합니다.";

    } else if (
        stats.reb >= 6
    ) {

        style =
            "리바운드 앵커";

        comment =
            "세컨드 찬스와 수비 리바운드에서 팀에 큰 영향을 주는 선수입니다.";

    } else if (
        stats.stl >= 2
    ) {

        style =
            "디펜시브 액티버";

        comment =
            "수비 압박과 스틸을 통해 경기 흐름을 바꾸는 유형입니다.";
    }


    if (
        stats.fga >= 5 &&
        fg < .35
    ) {

        comment +=
            " 슛 선택과 마무리 효율을 우선적으로 개선하면 좋겠습니다.";

    } else if (
        stats.threePA >= 4 &&
        three < .30
    ) {

        comment +=
            " 3점 슈팅의 릴리즈와 하체 밸런스 훈련을 추천합니다.";

    } else if (
        stats.ast >= 3 &&
        stats.tov >= 3
    ) {

        comment +=
            " 패스 선택과 볼 운반 안정성을 조금 더 다듬을 필요가 있습니다.";
    }


    return {

        style,

        comment,

        fg,

        three,

        assistTurnover
    };
}


/* =========================================================
   TRAINING RECOMMENDATION
   ========================================================= */

function generateTraining(
    playerId
) {

    const stats =
        getPlayerStats(
            playerId
        );

    const result = [];


    if (
        stats.fga > 0 &&
        stats.fgm /
        stats.fga < .4
    ) {

        result.push({

            title:
                "슈팅 효율 개선",

            description:
                "근거리 마무리 → 미드레인지 → 3점 순서로 성공률을 높이는 반복 훈련."
        });
    }


    if (
        stats.threePA > 0 &&
        stats.threePM /
        stats.threePA < .33
    ) {

        result.push({

            title:
                "3점 슈팅",

            description:
                "캐치앤슛과 원드리블 풀업을 분리해 릴리즈 일관성을 만드는 훈련."
        });
    }


    if (stats.tov >= 3) {

        result.push({

            title:
                "볼 핸들링",

            description:
                "압박 수비 상황에서 드리블을 유지하고 턴오버를 줄이는 1대1 압박 훈련."
        });
    }


    if (stats.ast < 2) {

        result.push({

            title:
                "패싱 & 시야",

            description:
                "킥아웃과 컷인 상황을 읽는 3×3 의사결정 훈련."
        });
    }


    if (stats.reb < 4) {

        result.push({

            title:
                "리바운드",

            description:
                "박스아웃 → 위치 선점 → 강한 양손 캐치까지 연결하는 반복 훈련."
        });
    }


    if (stats.stl < 1) {

        result.push({

            title:
                "수비 풋워크",

            description:
                "슬라이드와 클로즈아웃을 중심으로 3×3 수비 간격 유지 훈련."
        });
    }


    while (
        result.length < 4
    ) {

        result.push({

            title:
                "3×3 게임 리딩",

            description:
                "15분 경기에서 공격 전환과 수비 전환 속도를 높이는 게임 상황 훈련."
        });
    }


    return result.slice(0, 4);
}


/* =========================================================
   HEATMAP
   ========================================================= */

function setupHeatmapCanvas() {

    const canvas =
        el("heatmapCanvas");

    if (!canvas) return;

    canvas.addEventListener(
        "click",
        event => {

            const rect =
                canvas.getBoundingClientRect();

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


            if (
                selectedGameId &&
                selectedPlayerId
            ) {

                addShot({

                    gameId:
                        selectedGameId,

                    playerId:
                        selectedPlayerId,

                    x,
                    y,

                    made:
                        event.shiftKey,

                    points:
                        x > 65
                            ? 3
                            : 2
                });

                showToast(
                    event.shiftKey
                        ? "성공 슛 기록"
                        : "실패 슛 기록"
                );
            }
        }
    );
}


function drawHeatmap() {

    const canvas =
        el("heatmapCanvas");

    if (!canvas) return;

    const rect =
        canvas.getBoundingClientRect();

    const width =
        rect.width || 700;

    const height =
        width * .55;


    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    const ctx =
        canvas.getContext("2d");

    ctx.scale(
        dpr,
        dpr
    );


    /* Court */

    ctx.fillStyle =
        "#10161f";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    ctx.strokeStyle =
        "rgba(255,255,255,.15)";

    ctx.lineWidth = 1.5;

    ctx.strokeRect(
        10,
        10,
        width - 20,
        height - 20
    );


    /* Half court */

    ctx.beginPath();

    ctx.moveTo(
        width / 2,
        10
    );

    ctx.lineTo(
        width / 2,
        height - 10
    );

    ctx.stroke();


    /* Key */

    ctx.strokeRect(
        10,
        height * .26,
        width * .25,
        height * .48
    );


    /* Free throw */

    ctx.beginPath();

    ctx.arc(
        width * .25,
        height * .5,
        height * .11,
        -Math.PI / 2,
        Math.PI / 2
    );

    ctx.stroke();


    /* Three point arc */

    ctx.beginPath();

    ctx.arc(
        10,
        height / 2,
        height * .42,
        -Math.PI / 2,
        Math.PI / 2
    );

    ctx.stroke();


    const shots =
        state.shots.filter(
            shot =>
                shot.gameId ===
                    selectedGameId &&
                (
                    !selectedPlayerId ||
                    shot.playerId ===
                        selectedPlayerId
                )
        );


    shots.forEach(
        shot => {

            const px =
                (shot.x / 100) *
                width;

            const py =
                (shot.y / 100) *
                height;


            const gradient =
                ctx.createRadialGradient(
                    px,
                    py,
                    1,
                    px,
                    py,
                    14
                );


            gradient.addColorStop(
                0,
                shot.made
                    ? "rgba(56,217,150,.8)"
                    : "rgba(255,83,100,.65)"
            );

            gradient.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );


            ctx.fillStyle =
                gradient;

            ctx.fillRect(
                px - 16,
                py - 16,
                32,
                32
            );


            ctx.beginPath();

            ctx.arc(
                px,
                py,
                4,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                shot.made
                    ? "#38d996"
                    : "#ff5364";

            ctx.fill();
        }
    );
}


/* =========================================================
   PLAYER HEATMAP
   ========================================================= */

function setupPlayerHeatmapCanvas() {

    const canvas =
        el("playerHeatmapCanvas");

    if (!canvas) return;

    canvas.addEventListener(
        "click",
        event => {

            if (!selectedPlayerId) {
                return;
            }

            const rect =
                canvas.getBoundingClientRect();

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


            addShot({

                gameId:
                    selectedGameId,

                playerId:
                    selectedPlayerId,

                x,
                y,

                made:
                    true,

                points:
                    x > 65
                        ? 3
                        : 2
            });
        }
    );
}


function drawPlayerHeatmap() {

    const canvas =
        el("playerHeatmapCanvas");

    if (!canvas) return;


    const rect =
        canvas.getBoundingClientRect();

    const width =
        rect.width || 500;

    const height =
        width * .55;

    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    const ctx =
        canvas.getContext("2d");

    ctx.scale(
        dpr,
        dpr
    );


    ctx.fillStyle =
        "#10161f";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    ctx.strokeStyle =
        "rgba(255,255,255,.14)";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        8,
        8,
        width - 16,
        height - 16
    );


    ctx.beginPath();

    ctx.moveTo(
        width / 2,
        8
    );

    ctx.lineTo(
        width / 2,
        height - 8
    );

    ctx.stroke();


    const shots =
        getPlayerShots(
            selectedPlayerId
        );


    shots.forEach(
        shot => {

            const x =
                shot.x /
                100 *
                width;

            const y =
                shot.y /
                100 *
                height;


            const gradient =
                ctx.createRadialGradient(
                    x,
                    y,
                    0,
                    x,
                    y,
                    24
                );


            gradient.addColorStop(
                0,
                shot.made
                    ? "rgba(255,107,0,.5)"
                    : "rgba(255,83,100,.35)"
            );

            gradient.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );


            ctx.fillStyle =
                gradient;

            ctx.fillRect(
                x - 25,
                y - 25,
                50,
                50
            );
        }
    );
}


/* =========================================================
   VIDEO UPLOAD
   ========================================================= */

function setupVideoUpload() {

    const input =
        el("videoUpload");

    if (!input) return;


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];

            if (!file) return;


            if (
                !file.type.startsWith(
                    "video/"
                )
            ) {

                showToast(
                    "영상 파일만 업로드할 수 있습니다."
                );

                return;
            }


            if (currentVideoUrl) {

                URL.revokeObjectURL(
                    currentVideoUrl
                );
            }


            currentVideoUrl =
                URL.createObjectURL(
                    file
                );


            state.video.name =
                file.name;

            state.video.url =
                currentVideoUrl;


            const video =
                el("analysisVideo");

            const placeholder =
                qs(
                    ".video-placeholder"
                );


            if (video) {

                video.src =
                    currentVideoUrl;

                video.classList.add(
                    "loaded"
                );
            }


            if (placeholder) {

                placeholder.style.display =
                    "none";
            }


            const name =
                el("videoFileName");

            if (name) {

                name.textContent =
                    file.name;
            }


            saveData();

            showToast(
                "영상이 업로드되었습니다."
            );
        }
    );
}


/* =========================================================
   VIDEO ANALYSIS SIMULATION
   ========================================================= */

function simulateVideoAnalysis() {

    const progress =
        el("analysisProgress");

    const bar =
        el("progressBar");

    const message =
        el("progressMessage");


    if (!progress || !bar) {

        showToast(
            "분석 UI가 연결되지 않았습니다."
        );

        return;
    }


    progress.style.display =
        "block";


    let value = 0;


    const messages = [

        "영상 프레임 준비 중...",

        "선수 위치 추적 중...",

        "볼 위치 분석 중...",

        "슛 이벤트 탐지 중...",

        "리바운드 패턴 분석 중...",

        "패스 이벤트 분석 중...",

        "선수별 데이터 생성 중...",

        "리포트 생성 중..."
    ];


    const timer =
        setInterval(
            () => {

                value +=
                    Math.random() *
                    13 +
                    5;

                value =
                    Math.min(
                        value,
                        100
                    );


                bar.style.width =
                    `${value}%`;


                const index =
                    Math.min(
                        Math.floor(
                            value /
                            100 *
                            messages.length
                        ),
                        messages.length - 1
                    );


                if (message) {

                    message.textContent =
                        messages[index];
                }


                if (value >= 100) {

                    clearInterval(
                        timer
                    );

                    finishVideoAnalysis();
                }

            },
            400
        );
}


function finishVideoAnalysis() {

    /*
     * 브라우저 단독 버전에서는
     * 실제 AI 영상 인식 모델이 없으므로
     * 여기서는 분석 파이프라인의 결과
     * 표시를 담당한다.
     *
     * 실제 MediaPipe / YOLO / pose model을
     * 연결하면 이 부분에서 실제 이벤트를
     * 받아오도록 확장할 수 있다.
     */

    generateDemoEvents();

    renderEverything();

    showToast(
        "영상 분석이 완료되었습니다."
    );
}


function generateDemoEvents() {

    if (!selectedGameId) return;

    if (!selectedPlayerId) return;


    const player =
        getPlayer(
            selectedPlayerId
        );

    if (!player) return;


    const existing =
        state.events.filter(
            event =>
                event.gameId ===
                    selectedGameId &&
                event.playerId ===
                    selectedPlayerId
        );


    if (existing.length > 0) {
        return;
    }


    addEvent({

        gameId:
            selectedGameId,

        playerId:
            selectedPlayerId,

        type: "AST",

        value: 2,

        timestamp: 90
    });


    addEvent({

        gameId:
            selectedGameId,

        playerId:
            selectedPlayerId,

        type: "REB",

        value: 4,

        timestamp: 230
    });


    addEvent({

        gameId:
            selectedGameId,

        playerId:
            selectedPlayerId,

        type: "STL",

        value: 1,

        timestamp: 420
    });


    addEvent({

        gameId:
            selectedGameId,

        playerId:
            selectedPlayerId,

        type: "PTS",

        value: 6,

        timestamp: 580
    });


    saveData();
}


/* =========================================================
   SELECTS
   ========================================================= */

function populatePlayerSelects() {

    qsa(
        'select[name="playerId"]'
    ).forEach(select => {

        const current =
            select.value;

        select.innerHTML =
            state.players.map(
                player => `
                    <option value="${escapeHTML(player.id)}">
                        #${escapeHTML(player.number)}
                        ${escapeHTML(player.name)}
                    </option>
                `
            ).join("");

        if (current) {

            select.value =
                current;
        }
    });
}


function populateGameSelects() {

    qsa(
        'select[name="gameId"], #gameSelect'
    ).forEach(select => {

        select.innerHTML =
            state.games.map(
                game => `
                    <option value="${escapeHTML(game.id)}">
                        ${escapeHTML(game.date)}
                        · 설천고 ${game.homeScore}
                        - ${game.awayScore}
                        ${escapeHTML(game.opponent)}
                    </option>
                `
            ).join("");

        if (selectedGameId) {

            select.value =
                selectedGameId;
        }


        select.addEventListener(
            "change",
            () => {

                selectedGameId =
                    select.value;

                saveData();

                renderEverything();
            }
        );
    });
}


/* =========================================================
   PLAYER SELECTION
   ========================================================= */

function selectPlayer(
    playerId
) {

    selectedPlayerId =
        playerId;

    renderEverything();

    saveData();
}


/* =========================================================
   GAME SELECTION
   ========================================================= */

function selectGame(
    gameId
) {

    selectedGameId =
        gameId;

    renderEverything();

    saveData();
}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderEverything() {

    renderDashboard();

    renderPlayers();

    renderGameReport();

    renderLeague();

    renderVideoAnalysis();

    renderTraining();

    populatePlayerSelects();

    populateGameSelects();

    drawHeatmap();

    drawPlayerHeatmap();
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

    const latest =
        state.games[0];

    const latestScore =
        qs(
            "[data-latest-score]"
        );


    if (latestScore) {

        latestScore.innerHTML =
            latest
                ? `
                    <span>
                        설천고
                        <strong>
                            ${latest.homeScore}
                        </strong>
                    </span>

                    <em>:</em>

                    <span>
                        ${escapeHTML(
                            latest.opponent
                        )}
                        <strong>
                            ${latest.awayScore}
                        </strong>
                    </span>
                `
                : `
                    <span>설천고</span>
                    <em>:</em>
                    <span>상대팀</span>
                `;
    }


    const standings =
        getStandings();

    const seolcheon =
        standings.find(
            team =>
                team.id ===
                "team-seolcheon"
        );


    const rank =
        standings.indexOf(
            seolcheon
        ) + 1;


    setText(
        "[data-rank]",
        rank
            ? `${rank}위`
            : "-"
    );


    setText(
        "[data-average-for]",
        calculateAverage(
            state.games,
            "homeScore"
        ).toFixed(1)
    );


    setText(
        "[data-average-against]",
        calculateAverage(
            state.games,
            "awayScore"
        ).toFixed(1)
    );


    setText(
        "[data-win-rate]",
        seolcheon
            ? formatPercent(
                seolcheon.winRate
            )
            : "0%"
    );


    renderRecentGames();

    renderDashboardCoach();
}


function calculateAverage(
    games,
    property
) {

    if (!games.length) return 0;

    return average(
        games.map(
            game =>
                Number(
                    game[property] || 0
                )
        )
    );
}


function setText(
    selector,
    value
) {

    const node =
        qs(selector);

    if (node) {
        node.textContent =
            value;
    }
}


function renderRecentGames() {

    const container =
        el("recentGames");

    if (!container) return;


    if (!state.games.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                <span>◎</span>
                <strong>아직 경기 기록이 없습니다.</strong>
                <small>첫 경기를 등록해보세요.</small>
            </div>
            `;

        return;
    }


    container.innerHTML =
        state.games
            .slice(0, 5)
            .map(
                game => `
                    <div class="event-item">

                        <div class="event-time">
                            ${escapeHTML(game.date)}
                        </div>

                        <div class="event-main">
                            <strong>
                                설천고
                                ${game.homeScore}
                                :
                                ${game.awayScore}
                                ${escapeHTML(game.opponent)}
                            </strong>

                            <span>
                                3×3 · 15 MIN ·
                                ${
                                    game.result === "W"
                                        ? "WIN"
                                        : game.result === "L"
                                            ? "LOSS"
                                            : "DRAW"
                                }
                            </span>
                        </div>

                        <button
                            class="small-button"
                            data-action="game-report"
                            onclick="selectGame('${game.id}')"
                        >
                            REPORT
                        </button>

                    </div>
                `
            )
            .join("");
}


function renderDashboardCoach() {

    const node =
        el("dashboardCoach");

    if (!node) return;


    if (!selectedPlayerId) {

        node.textContent =
            "선수 데이터를 등록하면 AI 코치 분석이 시작됩니다.";

        return;
    }


    const player =
        getPlayer(
            selectedPlayerId
        );

    if (!player) return;


    const ai =
        generatePlayerCoach(
            selectedPlayerId
        );


    node.textContent =
        `${player.name} · ${ai.comment}`;
}


/* =========================================================
   PLAYER PAGE
   ========================================================= */

function renderPlayers() {

    renderPlayerList();

    renderSelectedPlayer();
}


function renderPlayerList() {

    const container =
        el("playerList");

    if (!container) return;


    if (!state.players.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                등록된 선수가 없습니다.
            </div>
            `;

        return;
    }


    container.innerHTML =
        state.players.map(
            player => `
                <button
                    class="player-list-item ${
                        player.id ===
                        selectedPlayerId
                            ? "active"
                            : ""
                    }"
                    onclick="selectPlayer('${player.id}')"
                >

                    <span
                        class="player-list-number"
                    >
                        #${escapeHTML(
                            player.number
                        )}
                    </span>

                    <span
                        class="player-list-info"
                    >
                        <strong>
                            ${escapeHTML(
                                player.name
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                player.position
                            )}
                        </span>
                    </span>

                </button>
            `
        )
        .join("");
}


function renderSelectedPlayer() {

    if (!selectedPlayerId) return;


    const player =
        getPlayer(
            selectedPlayerId
        );

    if (!player) return;


    const stats =
        getPlayerStats(
            selectedPlayerId
        );


    const ai =
        generatePlayerCoach(
            selectedPlayerId
        );


    setText(
        "[data-player-number]",
        `#${player.number}`
    );

    setText(
        "[data-player-name]",
        player.name
    );

    setText(
        "[data-player-position]",
        player.position
    );

    setText(
        "[data-player-style]",
        ai.style
    );


    setText(
        "[data-player-pts]",
        stats.pts
    );

    setText(
        "[data-player-reb]",
        stats.reb
    );

    setText(
        "[data-player-ast]",
        stats.ast
    );

    setText(
        "[data-player-stl]",
        stats.stl
    );

    setText(
        "[data-player-blk]",
        stats.blk
    );

    setText(
        "[data-player-tov]",
        stats.tov
    );


    const fg =
        stats.fga
            ? stats.fgm /
              stats.fga *
              100
            : 0;

    const three =
        stats.threePA
            ? stats.threePM /
              stats.threePA *
              100
            : 0;


    setText(
        "[data-player-fg]",
        formatPercent(fg)
    );

    setText(
        "[data-player-3p]",
        formatPercent(three)
    );


    setText(
        "[data-player-coach]",
        ai.comment
    );


    renderPlayerTraining(
        selectedPlayerId
    );
}


function renderPlayerTraining(
    playerId
) {

    const container =
        el("playerTraining");

    if (!container) return;


    const training =
        generateTraining(
            playerId
        );


    container.innerHTML =
        training
            .map(
                (item, index) => `
                    <div
                        class="training-card"
                    >

                        <span
                            class="training-index"
                        >
                            0${index + 1}
                        </span>

                        <h3>
                            ${escapeHTML(
                                item.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                item.description
                            )}
                        </p>

                    </div>
                `
            )
            .join("");
}


/* =========================================================
   GAME REPORT
   ========================================================= */

function renderGameReport() {

    const game =
        getGame(
            selectedGameId
        );

    if (!game) {

        setText(
            "[data-report-empty]",
            "경기를 등록하면 리포트가 생성됩니다."
        );

        return;
    }


    const teamStats =
        getTeamStats(
            game.id
        );


    setText(
        "[data-report-home]",
        game.homeScore
    );

    setText(
        "[data-report-away]",
        game.awayScore
    );


    setText(
        "[data-report-opponent]",
        game.opponent
    );


    setText(
        "[data-report-pts]",
        teamStats.pts
    );

    setText(
        "[data-report-reb]",
        teamStats.reb
    );

    setText(
        "[data-report-ast]",
        teamStats.ast
    );

    setText(
        "[data-report-stl]",
        teamStats.stl
    );


    const fg =
        teamStats.fga
            ? teamStats.fgm /
              teamStats.fga *
              100
            : 0;


    const three =
        teamStats.threePA
            ? teamStats.threePM /
              teamStats.threePA *
              100
            : 0;


    setText(
        "[data-report-fg]",
        formatPercent(fg)
    );

    setText(
        "[data-report-3p]",
        formatPercent(three)
    );


    renderGameEvents(game);

    renderGameCoach(game);
}


function renderGameEvents(
    game
) {

    const container =
        el("gameEvents");

    if (!container) return;


    const events =
        state.events.filter(
            event =>
                event.gameId ===
                game.id
        );


    if (!events.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                <span>◌</span>
                <strong>아직 이벤트 데이터가 없습니다.</strong>
                <small>
                    영상 분석 또는 이벤트 입력을 실행하세요.
                </small>
            </div>
            `;

        return;
    }


    container.innerHTML =
        events
            .sort(
                (a, b) =>
                    a.timestamp -
                    b.timestamp
            )
            .map(
                event => {

                    const player =
                        getPlayer(
                            event.playerId
                        );

                    return `
                        <div
                            class="event-item"
                        >

                            <div
                                class="event-time"
                            >
                                ${formatGameTime(
                                    event.timestamp
                                )}
                            </div>

                            <div
                                class="event-main"
                            >
                                <strong>
                                    ${escapeHTML(
                                        player?.name ||
                                        "선수"
                                    )}
                                </strong>

                                <span>
                                    ${event.type}
                                    +${event.value}
                                </span>
                            </div>

                            <div
                                class="event-type"
                            >
                                ${event.type}
                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


function formatGameTime(
    seconds
) {

    const min =
        Math.floor(
            seconds / 60
        );

    const sec =
        Math.floor(
            seconds % 60
        );

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}


function renderGameCoach(
    game
) {

    const container =
        el("gameCoach");

    if (!container) return;


    const stats =
        getTeamStats(
            game.id
        );


    let comment =
        "공수 밸런스를 유지한 경기입니다.";


    if (
        stats.tov >= 6
    ) {

        comment =
            "턴오버 관리가 다음 경기의 가장 중요한 개선 포인트입니다.";

    } else if (
        stats.reb >= 10
    ) {

        comment =
            "리바운드에서 우위를 가져가며 추가 공격 기회를 잘 만들었습니다.";

    } else if (
        stats.ast >= 6
    ) {

        comment =
            "볼 무브먼트가 좋았고 동료를 활용한 공격 전개가 돋보였습니다.";

    } else if (
        stats.fga > 0 &&
        stats.fgm /
        stats.fga < .35
    ) {

        comment =
            "슈팅 효율 개선을 위해 공격 선택과 마무리 훈련이 필요합니다.";
    }


    container.textContent =
        comment;
}


/* =========================================================
   LEAGUE PAGE
   ========================================================= */

function renderLeague() {

    const standings =
        getStandings();


    const container =
        el("standingsBody");

    if (!container) return;


    if (!standings.length) {

        container.innerHTML =
            `
            <tr class="empty-table-row">
                <td colspan="8">
                    아직 리그 데이터가 없습니다.
                </td>
            </tr>
            `;

        return;
    }


    container.innerHTML =
        standings.map(
            (team, index) => `

                <tr>

                    <td>
                        <span class="rank-number">
                            ${index + 1}
                        </span>
                    </td>

                    <td>
                        <div class="team-cell">

                            <span
                                class="table-team-logo"
                            >
                                ${escapeHTML(
                                    team.short
                                )}
                            </span>

                            ${escapeHTML(
                                team.name
                            )}

                        </div>
                    </td>

                    <td>
                        ${team.games}
                    </td>

                    <td>
                        ${team.wins}
                    </td>

                    <td>
                        ${team.losses}
                    </td>

                    <td>
                        ${team.pointsFor}
                    </td>

                    <td>
                        ${team.pointsAgainst}
                    </td>

                    <td
                        class="${
                            team.diff >= 0
                                ? "diff-positive"
                                : "diff-negative"
                        }"
                    >
                        ${
                            team.diff > 0
                                ? "+"
                                : ""
                        }${team.diff}
                    </td>

                </tr>
            `
        )
        .join("");


    if (standings[0]) {

        setText(
            "[data-league-games]",
            standings[0].games
        );

        setText(
            "[data-league-wins]",
            standings[0].wins
        );

        setText(
            "[data-league-winrate]",
            formatPercent(
                standings[0].winRate
            )
        );
    }
}


/* =========================================================
   VIDEO PAGE
   ========================================================= */

function renderVideoAnalysis() {

    const fileName =
        el("videoFileName");

    if (
        fileName &&
        state.video.name
    ) {

        fileName.textContent =
            state.video.name;
    }


    const video =
        el("analysisVideo");

    if (
        video &&
        state.video.url &&
        !video.src
    ) {

        video.src =
            state.video.url;

        video.classList.add(
            "loaded"
        );
    }
}


/* =========================================================
   TRAINING PAGE
   ========================================================= */

function renderTraining() {

    const container =
        el("trainingResults");

    if (!container) return;


    if (!selectedPlayerId) {

        container.innerHTML =
            `
            <div class="empty-state">
                <strong>
                    선수를 선택해주세요.
                </strong>
            </div>
            `;

        return;
    }


    const training =
        generateTraining(
            selectedPlayerId
        );


    container.innerHTML =
        training
            .map(
                (item, index) => `
                    <div
                        class="training-card"
                    >

                        <span
                            class="training-index"
                        >
                            0${index + 1}
                        </span>

                        <h3>
                            ${escapeHTML(
                                item.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                item.description
                            )}
                        </p>

                    </div>
                `
            )
            .join("");
}


/* =========================================================
   DATA RESET
   ========================================================= */

function resetAllData() {

    if (
        !confirm(
            "모든 경기·선수·슛 데이터를 삭제할까요?"
        )
    ) {
        return;
    }


    state =
        structuredClone(
            DEFAULT_DATA
        );


    selectedPlayerId =
        state.players[0]?.id ||
        null;

    selectedGameId =
        null;


    saveData();

    renderEverything();

    showToast(
        "모든 데이터가 초기화되었습니다."
    );
}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.selectPlayer =
    selectPlayer;

window.selectGame =
    selectGame;

window.navigateTo =
    navigateTo;

window.addShot =
    addShot;

window.addEvent =
    addEvent;

window.showToast =
    showToast;


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * ESC
         */

        if (
            event.key === "Escape"
        ) {

            closeAllModals();
        }


        /*
         * R
         * 리포트
         */

        if (
            event.key.toLowerCase() ===
            "r" &&
            !isTyping()
        ) {

            navigateTo(
                "game-report"
            );
        }


        /*
         * P
         * 선수
         */

        if (
            event.key.toLowerCase() ===
            "p" &&
            !isTyping()
        ) {

            navigateTo(
                "player-report"
            );
        }


        /*
         * L
         * 리그
         */

        if (
            event.key.toLowerCase() ===
            "l" &&
            !isTyping()
        ) {

            navigateTo(
                "league"
            );
        }
    }
);


function isTyping() {

    const tag =
        document.activeElement
            ?.tagName;

    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
    );
}


/* =========================================================
   DEMO DATA
   ========================================================= */

function createDemoGame() {

    if (state.games.length) {
        return;
    }


    const game = {

        id: uid("game"),

        date:
            new Date()
                .toISOString()
                .slice(0, 10),

        opponent:
            "한빛고",

        homeScore:
            21,

        awayScore:
            14,

        duration:
            15,

        result:
            "W",

        playerStats: {},

        notes:
            "3×3 리그전"
    };


    state.players.forEach(
        player => {

            game.playerStats[
                player.id
            ] = createEmptyStats();
        }
    );


    const players =
        state.players;


    if (players[0]) {

        game.playerStats[
            players[0].id
        ] = {

            pts: 9,
            reb: 4,
            ast: 3,
            stl: 1,
            blk: 0,
            tov: 1,

            fgm: 4,
            fga: 8,

            twoPM: 2,
            twoPA: 4,

            threePM: 2,
            threePA: 4
        };
    }


    if (players[1]) {

        game.playerStats[
            players[1].id
        ] = {

            pts: 7,
            reb: 5,
            ast: 2,
            stl: 1,
            blk: 1,
            tov: 1,

            fgm: 3,
            fga: 6,

            twoPM: 3,
            twoPA: 5,

            threePM: 0,
            threePA: 1
        };
    }


    if (players[2]) {

        game.playerStats[
            players[2].id
        ] = {

            pts: 5,
            reb: 6,
            ast: 1,
            stl: 0,
            blk: 1,
            tov: 1,

            fgm: 2,
            fga: 4,

            twoPM: 2,
            twoPA: 4,

            threePM: 0,
            threePA: 0
        };
    }


    state.games.push(
        game
    );


    selectedGameId =
        game.id;


    /*
     * 샘플 슛 데이터
     */

    players.forEach(
        player => {

            for (
                let i = 0;
                i < 6;
                i++
            ) {

                state.shots.push({

                    id: uid("shot"),

                    gameId:
                        game.id,

                    playerId:
                        player.id,

                    x:
                        Math.random() *
                        82 +
                        8,

                    y:
                        Math.random() *
                        84 +
                        8,

                    made:
                        Math.random() >
                        .4,

                    points:
                        Math.random() >
                        .72
                            ? 3
                            : 2,

                    createdAt:
                        Date.now()
                });
            }
        }
    );


    saveData();

    renderEverything();

    showToast(
        "샘플 경기 데이터를 생성했습니다."
    );
}


/* =========================================================
   OPTIONAL DEMO BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target.closest(
                "[data-demo]"
            );

        if (!target) return;

        createDemoGame();
    }
);


/* =========================================================
   OUTSIDE CLICK FOR MODAL
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const close =
            event.target.closest(
                ".modal-close"
            );

        if (close) {

            closeAllModals();
        }
    }
);


/* =========================================================
   INITIAL DEMO DATA
   ---------------------------------------------------------
   필요하면 index.html에
   data-demo="true"
   버튼을 넣어서 실행 가능.
   ========================================================= */


/* =========================================================
   FINAL
   ========================================================= */

console.log(
    "%c SEOLCHEON 3×3 PERFORMANCE LAB ",
    "background:#ff6b00;color:#fff;padding:8px;font-weight:bold"
);

console.log(
    "Performance analytics system initialized."
);