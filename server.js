//��������ҳ�沿��
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users=[];//�������������û����ǳ�
app.use('/', express.static(__dirname + '/www'));
server.listen(8084);
//socket����
io.on('connection', function(socket) {
    //�ǳ�����
    socket.on('login', function(nickname) {
		 if (users.indexOf(nickname) > -1) {
			 socket.emit('nickExisted');
		 } else {
			 socket.userIndex = users.length;
			 socket.nickname = nickname;
			 users.push(nickname);
			 socket.emit('loginSuccess');
			 io.sockets.emit('system', nickname, users.length, 'login');
		 };
	 });
	 
	 //�Ͽ����ӵ��¼�
	socket.on('disconnect', function() {
		//���Ͽ����ӵ��û���users��ɾ��
		users.splice(socket.userIndex, 1);
		//֪ͨ���Լ������������
		socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});

	//��������Ϣ
    socket.on('postMsg', function(msg) {
        //����Ϣ���͵����Լ���������û�
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });

	//�����û�������ͼƬ
	 socket.on('img', function(imgData) {
		//ͨ��һ��newImg�¼��ַ������Լ����ÿ���û�
		 socket.broadcast.emit('newImg', socket.nickname, imgData);
	 });
	 
	 
});