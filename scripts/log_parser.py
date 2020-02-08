#!/usr/bin/env python

import os
import re
import smtplib
from string import Template
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email_server_setup import MX, PORT, FROM, TO, SUBJECT, LOGIN, PASS, LOG_FILE


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
    smtp_server = smtplib.SMTP(host=MX, port=PORT)
    smtp_server.starttls()
    smtp_server.login(LOGIN, PASS)

    msg = MIMEMultipart()       # create a message
    msg['From']    = FROM
    msg['To']      = TO
    msg['Subject'] = SUBJECT

    msg.attach(MIMEText(body, 'plain'))
    smtp_server.sendmail(msg['From'], msg['To'], msg.as_string());
    smtp_server.quit()

def GetHeadersOfEmail():
    hostname = os.uname()[1]
    header = """
 Este e-mail e automatizado, favor nao responder.
 A seguinte tabela abaixo apresenta os acesso do servidor
 (servidor: %s)
 com dados do access log do servico http{,s}, agregados por url,
 codigo bem como respectivas frequencias de acesso:


    """ % (hostname)

    return header

def FormatTable(dic):
    template = "|{URL:30}|{COD:6}|{FREQ:6}|"
    hdr = "{0:-<45}|\n".format('|')
    formated = '\n' + hdr
    formated += template.format(URL="URL", COD="COD.", FREQ="FREQ.") + '\n'
    formated += hdr

    for val in dic:
        url_cod = val.split()
        row = {'URL': url_cod[0], 'COD': url_cod[1], 'FREQ': dic[val]}
        formated += template.format(**row) + '\n'
    formated += hdr
    formated += "\n\nLinx Impulse."

    return formated

email_body = GetHeadersOfEmail()
dic = GetFreqAccessLog()
email_body += FormatTable(dic)
print(email_body)
SendEmail(email_body)
