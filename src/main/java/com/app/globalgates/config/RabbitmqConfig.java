package com.app.globalgates.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitmqConfig {

    public static final String CHAT_EXCHANGE = "chat.exchange";
    public static final String CHAT_ROUTING_KEY = "chat.message";

    @Bean
    public DirectExchange chatExchange() {
        return new DirectExchange(CHAT_EXCHANGE);
    }

    // 인스턴스마다 고유한 비지속 큐를 만든다. 같은 exchange/routing-key에 두 인스턴스가
    // 각자 binding 하면 RabbitMQ는 양쪽 큐 모두에 메시지를 복사 전달 → 각 인스턴스가 자기
    // SimpMessagingTemplate(메모리 SimpleBroker)로 STOMP 브로드캐스트 → 어느 인스턴스에
    // 붙은 WebSocket 클라이언트든 메시지를 받는다.
    //
    // 이전에는 모든 인스턴스가 동일한 durable 큐("chat.queue")를 공유해서 RabbitMQ가
    // 라운드로빈으로 한 메시지를 한 인스턴스에만 전달했고, 다른 인스턴스에 붙은 클라이언트는
    // 메시지를 놓치는 alternating UI 누락이 발생했다.
    @Bean
    public Queue chatQueue() {
        return new AnonymousQueue();
    }

    @Bean
    public Binding chatBinding(Queue chatQueue, DirectExchange chatExchange) {
        return BindingBuilder.bind(chatQueue).to(chatExchange).with(CHAT_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
