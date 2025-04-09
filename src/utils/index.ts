import { ethers } from 'ethers';

/**
 * 格式化错误信息
 */
export const formatError = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Unknown error';
};

/**
 * 验证地址是否有效
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * 转换为wei值
 */
export const toWei = (value: string | number): string => {
  try {
    return ethers.utils.parseEther(value.toString()).toString();
  } catch (error) {
    throw new Error(`转换Wei值失败: ${formatError(error)}`);
  }
};

/**
 * 转换为eth值
 */
export const fromWei = (value: string | number): string => {
  try {
    return ethers.utils.formatEther(value.toString());
  } catch (error) {
    throw new Error(`从Wei转换失败: ${formatError(error)}`);
  }
};
