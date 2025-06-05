import axios from "@/lib/axios";
import {
  CreateMessageDto,
  DeleteMessageDto,
  GetMessagesQueryDto,
  UpdateMessageDto,
} from "@/utils";

export const createMessage = async (createMessageDto: CreateMessageDto) => {
  const response = await axios.post(
    "/conversations/messages",
    createMessageDto,
  );

  return response.data;
};

export const getConversationWithTargetUser = async (targetUserId: string) => {
  const response = await axios.get(`/conversations/with/${targetUserId}`);

  return response.data;
};

export const getMessagesOfConversation = async (
  conversationId: string,
  getMessagesQueryDto?: GetMessagesQueryDto,
) => {
  const response = await axios.get(
    `/conversations/${conversationId}/messages`,
    {
      params: getMessagesQueryDto,
    },
  );

  return response.data;
};

export const updateMessage = async (updateMessageDto: UpdateMessageDto) => {
  const { conversationId, messageId, content } = updateMessageDto;

  const response = await axios.patch(
    `/conversations/${conversationId}/messages/${messageId}`,
    {
      content,
    },
  );

  return response.data;
};

export const deleteMessage = async (deleteMessageDto: DeleteMessageDto) => {
  const { conversationId, messageId } = deleteMessageDto;

  const response = await axios.delete(
    `/conversations/${conversationId}/messages/${messageId}`,
  );

  return response.data;
};
