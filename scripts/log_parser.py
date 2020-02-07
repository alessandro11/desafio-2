#!/usr/bin/env python

import sys
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

#
# Email
#
MX="mx.c3sl.ufpr.br"
PORT=587
FROM="aelias@c3sl.ufpr.br"
TO="ale.elias2011@gmail.com"
SUBJECT="Relatorio - Desafio parte 2"
LOGIN="aelias"
PASS="st@nd@rd7940"

#
# Log file to be parsed.
#
LOG_FILE = "/var/log/nginx/access.log"

# Regular expression
lineformat = re.compile(r"""(?P<ipaddress>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - - \[(?P<dateandtime>\d{2}\/[a-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2} (\+|\-)\d{4})\] ((\"(GET|POST) )(?P<url>.+)(http\/1\.1")) (?P<statuscode>\d{3}) (?P<bytessent>\d+) (["](?P<refferer>(\-)|(.+))["]) (["](?P<useragent>.+)["])""", re.IGNORECASE)


def GetFreqAccessLog():
    logfile = open(LOG_FILE)

    dic_resource = {}
    for l in logfile.readlines():
        data = re.search(lineformat, l)
        if data:
            datadict = data.groupdict()
            url = datadict["url"]
            status = datadict["statuscode"]
            
            if url+status in dic_resource:
                dic_resource[url+status] += 1
            else:
                dic_resource[url+status] = 1

    logfile.close()
    return dic_resource

def SendEmail(body):
    smtp_serv = smtplib.SMTP(host=MX, port=PORT)
    smtp_serv.starttls()
    smtp_serv.login(LOGIN, PASS)
    
    msg = MIMEMultipart()       # create a message
    msg['From']    = FROM
    msg['To']      = TO
    msg['Subject'] = SUBJECT

    msg.attach(MIMEText(body, 'plain'))
    smtp_serv.sendmail(msg['From'], msg['To'], msg.as_string());
    smtp_serv.quit()

report = GetFreqAccessLog()
SendEmail(str(report))
