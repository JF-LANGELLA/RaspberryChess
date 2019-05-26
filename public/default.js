(function () {
    WinJS.UI.processAll().then(function () {
        var socket, serverGame;
        var username, playerColor;
        var game, board;
        var usersOnline = [];
        var myGames = [];
        var source;
        var target;
        var ccounter;
        socket = io();

        //////////////////////////////
        // Socket.io handlers
        //////////////////////////////

        socket.on('login', function (msg) {
            usersOnline = msg.users;
            updateUserList();

            myGames = msg.games;
            updateGamesList();
        });

        socket.on('joinlobby', function (msg) {
            addUser(msg);
        });

        socket.on('leavelobby', function (msg) {
            removeUser(msg);
        });

        socket.on('gameadd', function (msg) {
        });

        socket.on('resign', function (msg) {
            if (msg.gameId == serverGame.id) {

                socket.emit('login', username);

                $('#page-lobby').show();
                $('#page-game').hide();
            }
        });

        socket.on('joingame', function (msg) {
            console.log("joined as game id: " + msg.game.id);
            playerColor = msg.color;
            initGame(msg.game);

            $('#page-lobby').hide();
            $('#page-game').show();
        });

        socket.on('move', function (msg) {
            if (serverGame && msg.gameId === serverGame.id) {
                game.move(msg.move);
                board.position(game.fen());
            }
        });

        socket.on('rpi', function (msg) {
            if (msg.userId != username) return;
            if (serverGame && msg.gameId === serverGame.id) {
                game.move(msg.move);
                board.position(game.fen());
            }

            var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

            if (typeof msg.source !== "undefined") {
                board.highlight_source(msg.source);
                source = msg.source;
            }

            if (typeof msg.target !== "undefined") {
                board.highlight_source(source);
                board.highlight_target(msg.target);
                board.move_pieces(source, msg.target);
            }

            if (typeof msg.select !== "undefined") { board.highlight_select(msg.select); }

            /*
            letters.forEach(function (element) {
                for (var i = 1; i <= 8; i++) {
                    source = element + i;
                    board.highlight(source);
                }
            });
            */
        });

        socket.on('logout', function (msg) {
            removeUser(msg.username);
        });

        //////////////////////////////
        // Menus
        ////////////////////////////// 
        $('#login').on('click', function () {
            username = $('#username').val();

            if (username.length > 0) {
                $('#userLabel').text(username);
                socket.emit('login', username);

                $('#page-login').hide();
                $('#page-lobby').show();
            }
        });

        $('#username').on('keydown', function (e) {
            if (e.which == 13) {
                username = $('#username').val();

                if (username.length > 0) {
                    $('#userLabel').text(username);
                    socket.emit('login', username);

                    $('#page-login').hide();
                    $('#page-lobby').show();
                }
            }
        });

        $('#username').focus();

        $('#game-back').on('click', function () {
            socket.emit('login', username);

            $('#page-game').hide();
            $('#page-lobby').show();
        });

        $('#game-resign').on('click', function () {
            socket.emit('resign', { userId: username, gameId: serverGame.id });

            socket.emit('login', username);
            $('#page-game').hide();
            $('#page-lobby').show();
        });

        var addUser = function (userId) {
            usersOnline.push(userId);
            updateUserList();
        };

        var removeUser = function (userId) {
            for (var i = 0; i < usersOnline.length; i++) {
                if (usersOnline[i] === userId) {
                    usersOnline.splice(i, 1);
                }
            }

            updateUserList();
        };

        var updateGamesList = function () {
            document.getElementById('gamesList').innerHTML = '';
            myGames.forEach(function (game) {
                $('#gamesList').append($('<button>')
                    .text('#' + game)
                    .on('click', function () {
                        socket.emit('resumegame', game);
                    }));
            });
        };

        var updateUserList = function () {
            document.getElementById('userList').innerHTML = '';
            usersOnline.forEach(function (user) {
                $('#userList').append($('<button>')
                    .text(user)
                    .on('click', function () {
                        socket.emit('invite', user);
                    }));
            });
        };

        //////////////////////////////
        // Chess Game
        ////////////////////////////// 

        var initGame = function (serverGameState) {
            serverGame = serverGameState;

            var cfg = {
                draggable: true,
                showNotation: true,
                orientation: playerColor,
                position: serverGame.board ? serverGame.board : 'start',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onSnapEnd: onSnapEnd
            };

            game = serverGame.board ? new Chess(serverGame.board) : new Chess();
            board = new ChessBoard('game-board', cfg);
        }

        // do not pick up pieces if the game is over
        // only pick up pieces for the side to move
        var onDragStart = function (source, piece, position, orientation) {
            if (game.game_over() === true ||
                (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
                (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
                (game.turn() !== playerColor[0])) {
                return false;
            }
        };

        var onDrop = function (source, target) {
            // see if the move is legal
            var move = game.move({
                from: source,
                to: target,
                promotion: 'q' // NOTE: always promote to a queen for example simplicity
            });

            // illegal move
            if (move === null) {
                return 'snapback';
            } else {
                socket.emit('move', { move: move, gameId: serverGame.id, board: game.fen() });
            }

        };

        // update the board position after the piece snap
        // for castling, en passant, pawn promotion
        var onSnapEnd = function () {
            board.position(game.fen());
        };
    });
})();