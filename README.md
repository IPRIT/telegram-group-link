#Binder Bot for Telegram

--------

[@group_link_bot](https://telegram.me/group_link_bot)

Данная инструкция поможет Вам детально разобраться в возможностях этого Бота.

Итак. Максимальное количество групп, которые можно связывать в одну: 20.
Администратором бота в группе считается тот человек, который добавил бота в группу.

Администратор бота в группе имеет следующие возможности:
1) Получать одноразовый код для соединения с другой группой.
2) Удалять соединение с другой группой.
3) Вставлять полученный из другой группы код в текущую группу для соединения.

Группы можно соединить как одному человеку, так и двум.
Пример: Вы добавили Бота в группу A — теперь вы являетесь администратором Бота. Вы можете получить код для соединения с помощью команды /connect и отправить другому человеку из группы Б, который соединит две группы А и Б. Этот другой человек должен быть администратором бота в своей группе Б.
Администраторы ботов в группах А и Б могут удалять соединение друг с другом, т. е. администратор группы А может удалить соединение с группой Б также, как и наоборот.
Удаление соединения делается с помощью команды /drop_connect.

Все участники групп могут просматривать соединения с другими группами с помощью команды /list.

Коротко о командах:

/connect — получить одноразовый код для соединения с другой группой. Команда действует только для администратора. Код видят все, так как он одноразовый*.

/drop_connect — удалить соединение с выбранной группой.

/list — посмотреть список групп, которые находятся в одной связке.

/help — получить эту справку.

[*] — если в Вашей уютной группе завелся редиска, который скопировал код и связал с другой нежелательной Вам группой быстрее Вас, — не переживайте! Вы всегда можете удалить это соединение (и редиску) и получить новый код для связывания.