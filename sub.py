#!/usr/bin/python
# -*- coding: utf-8 -*-

import time
import os
import sys

import paho.mqtt.client as mqtt
import subprocess

host = 'xxx.cloudmqtt.com'
port = 00000

keepalive = 60

def on_connect(client, userdata, flags, rc):
    print('Connected with result code ' + str(rc))
    client.subscribe('light')  # topic名: light を受け取るよう設定
    client.subscribe('aircon') # topic名: aircon を受け取るよう設定


def on_message(client, userdata, msg): # 上で設定した topic が publish されると、ここで受け取る
    print('on_message:' + msg.topic + ',' + str(msg.payload))
    if msg.payload == 'ON':
        cmd = 'on'
    if msg.payload == 'OFF':
        cmd = 'off'
    if msg.topic == 'aircon' and msg.payload == 'ON':
        cmd = 'on_warm'

    # 外部コマンドの呼び出しを使って LIRC の送信コマンド irsend を呼んでいます
    # $ irsend SEND_ONCE 機器名 送信コード名
    # この例では topic名が機器名と同じになっています
    retcode = subprocess.call(['irsend', 'SEND_ONCE', msg.topic, cmd])
    print('retcode:'+retcode)

    
def main_unit(): # デーモン化したプロセスのメイン
    while True:
        client = mqtt.Client()
        client.username_pw_set('username','password')
        client.on_connect = on_connect
        client.on_message = on_message

        client.connect(host, port, keepalive)

        client.loop_forever()        


def daemonize():
    pid = os.fork() # ここでプロセスをforkする
    if pid > 0: # 親プロセスの場合(pidは子プロセスのプロセスID)
        pid_file = open('/var/run/python_daemon.pid','w')
        pid_file.write(str(pid)+"\n")
        pid_file.close()
        sys.exit()
    if pid == 0: # 子プロセスの場合
        main_unit()

if __name__ == '__main__':
    while True:
        daemonize()
