#!/bin/bash
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
USEDMEMORY=$(free -m | awk 'NR==2{printf "%.2f\t", $3*100/$2 }')
TCP_CONN=$(netstat -an | wc -l)
TCP_CONN_PORT_3000=$(netstat -an | grep 3000 | wc -l)
IO_WAIT=$(iostat | awk 'NR==4 {print $5}')

aws cloudwatch put-metric-data --metric-name beerconomy-memory-usage --dimensions Instance=$INSTANCE_ID --namespace "Custom" --value $USEDMEMORY

aws cloudwatch put-metric-data --metric-name beerconomy-Tcp_connections --dimensions Instance=$INSTANCE_ID --namespace "Custom" --value $TCP_CONN

aws cloudwatch put-metric-data --metric-name beerconomy-TCP_connection_on_port_3000 --dimensions Instance=$INSTANCE_ID --namespace "Custom" --value $TCP_CONN_PORT_3000

aws cloudwatch put-metric-data --metric-name beerconomy-IO_WAIT --dimensions Instance=$INSTANCE_ID --namespace "Custom" --value $IO_WAIT

