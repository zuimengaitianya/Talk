window.onload = function() {
    //ʵ������ʼ�����ǵ�hichat����
    var hichat = new HiChat();
    hichat.init();
};

//�������ǵ�hichat��
var HiChat = function() {
    this.socket = null;
};

//��ԭ�����ҵ�񷽷�
HiChat.prototype = {
    init: function() {//�˷�����ʼ������
        var that = this;
        //��������������socket����
        this.socket = io.connect();
        //����socket��connect�¼������¼���ʾ�����Ѿ�����
        this.socket.on('connect', function() {
            //���ӵ�����������ʾ�ǳ������
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
		
		//�ǳ����õ�ȷ����ť
		document.getElementById('loginBtn').addEventListener('click', function() {
			var nickName = document.getElementById('nicknameInput').value;
			//����ǳ�������Ƿ�Ϊ��
			if (nickName.trim().length != 0) {
				//��Ϊ�գ�����һ��login�¼�����������ǳƷ��͵�������
				that.socket.emit('login', nickName);
			} else {
				//����������ý���
				document.getElementById('nicknameInput').focus();
			};
		}, false);
		
		document.getElementById('sendBtn').addEventListener('click', function() {
			var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value,
				//��ȡ��ɫֵ
				color = document.getElementById('colorStyle').value;
			messageInput.value = '';
			messageInput.focus();
			if (msg.trim().length != 0) {
				//��ʾ�ͷ���ʱ������ɫֵ����
				that.socket.emit('postMsg', msg, color);
				that._displayNewMsg('me', msg, color);
			};
		}, false);
		
		document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
			  if (e.keyCode == 13) {
				  var nickName = document.getElementById('nicknameInput').value;
				  if (nickName.trim().length != 0) {
					  that.socket.emit('login', nickName);
				  };
			  };
		  }, false);
		 
		document.getElementById('messageInput').addEventListener('keyup', function(e) {
			  var messageInput = document.getElementById('messageInput'),
				  msg = messageInput.value,
				  color = document.getElementById('colorStyle').value;
			  if (e.keyCode == 13 && msg.trim().length != 0) {
				  messageInput.value = '';
				  that.socket.emit('postMsg', msg, color);
				  that._displayNewMsg('me', msg, color);
			  };
		 }, false);
		
		this.socket.on('nickExisted', function() {
			 document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //��ʾ�ǳƱ�ռ�õ���ʾ
		 });
		 
		this.socket.on('loginSuccess', function() {
			 document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
			 document.getElementById('loginWrapper').style.display = 'none';//�������ֲ����������
			 document.getElementById('messageInput').focus();//����Ϣ������ý���
		 });
		 
		this.socket.on('system', function(nickName, userCount, type) {
			var msg = nickName + (type == 'login' ? ' joined' : ' left');
			//ָ��ϵͳ��Ϣ��ʾΪ��ɫ
			that._displayNewMsg('system ', msg, 'red');
			document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
		});
		 
		this.socket.on('newMsg', function(user, msg, color) {
			 that._displayNewMsg(user, msg, color);
		 });
		 
		document.getElementById('sendImage').addEventListener('change', function() {
			//����Ƿ����ļ���ѡ��
			 if (this.files.length != 0) {
				//��ȡ�ļ�����FileReader���ж�ȡ
				 var file = this.files[0],
					 reader = new FileReader();
				 if (!reader) {
					 that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
					 this.value = '';
					 return;
				 };
				 reader.onload = function(e) {
					//��ȡ�ɹ�����ʾ��ҳ�沢���͵�������
					 this.value = '';
					 that.socket.emit('img', e.target.result);
					 that._displayImage('me', e.target.result);
				 };
				 reader.readAsDataURL(file);
			 };
		 }, false);
		 
		this.socket.on('newImg', function(user, img) {
			 that._displayImage(user, img);
		 });
		 
		this._initialEmoji();
		document.getElementById('emoji').addEventListener('click', function(e) {
			 var emojiwrapper = document.getElementById('emojiWrapper');
			 emojiwrapper.style.display = 'block';
			 e.stopPropagation();
		 }, false);
		 
		document.body.addEventListener('click', function(e) {
			 var emojiwrapper = document.getElementById('emojiWrapper');
			 if (e.target != emojiwrapper) {
				 emojiwrapper.style.display = 'none';
			 };
		});
		 
		document.getElementById('emojiWrapper').addEventListener('click', function(e) {
			//��ȡ������ı���
			var target = e.target;
			if (target.nodeName.toLowerCase() == 'img') {
				var messageInput = document.getElementById('messageInput');
				messageInput.focus();
				messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
			};
		}, false);
		 
		 
    },
	_displayImage: function(user, imgData, color) {
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('p'),
			date = new Date().toTimeString().substr(0, 8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},
	_showEmoji: function(msg) {
		var match, result = msg,
			reg = /\[emoji:\d+\]/g,
			emojiIndex,
			totalEmojiNum = document.getElementById('emojiWrapper').children.length;
		while (match = reg.exec(msg)) {
			emojiIndex = match[0].slice(7, -1);
			if (emojiIndex > totalEmojiNum) {
				result = result.replace(match[0], '[X]');
			} else {
				result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.jpg" />');
			};
		};
		return result;
	},
	_displayNewMsg: function(user, msg, color) {
		 var container = document.getElementById('historyMsg'),
			 msgToDisplay = document.createElement('p'),
			 date = new Date().toTimeString().substr(0, 8),
			 //����Ϣ�еı���ת��ΪͼƬ
			 msg = this._showEmoji(msg);
		 msgToDisplay.style.color = color || '#000';
		 msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
		 container.appendChild(msgToDisplay);
		 container.scrollTop = container.scrollHeight;
	 },
	_initialEmoji: function() {
		var emojiContainer = document.getElementById('emojiWrapper'),
			docFragment = document.createDocumentFragment();
		for (var i = 69; i > 0; i--) {
			var emojiItem = document.createElement('img');
			emojiItem.src = '../content/emoji/' + i + '.jpg';
			emojiItem.title = i;
			docFragment.appendChild(emojiItem);
		};
		emojiContainer.appendChild(docFragment);
	}
};


