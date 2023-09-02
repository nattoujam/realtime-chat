#!/bin/sh

endpoint='http://localhost:8000'
user1='{"name":"hoge"}'
user2='{"name":"fuga"}'

echo "post login 1"
curl -X POST -H "Content-Type: application/json" -d $user1 $endpoint/login
echo ''

echo "post login 2"
curl -X POST -H "Content-Type: application/json" -d $user2 $endpoint/login
echo ''

echo "post room"
curl -X POST -H "Content-Type: application/json" -d '{"name":"hoge","host":'$user1',"members":['$user1']}' $endpoint/rooms
echo ''

echo 'post room 1 join'
curl -X POST -H "Content-Type: application/json" -d $user2 $endpoint/rooms/1/join
echo ''

echo "get room 1"
curl $endpoint/rooms/1
echo ''