// Branded types for strong type safety
export type ServerId = number & { readonly brand: 'ServerId' };
export type ChannelId = number & { readonly brand: 'ChannelId' };
export type UserId = number & { readonly brand: 'UserId' };
export type MessageId = number & { readonly brand: 'MessageId' };
export type CategoryId = number & { readonly brand: 'CategoryId' };
