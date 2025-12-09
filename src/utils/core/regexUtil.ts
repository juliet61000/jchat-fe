import { ID_REGEX, PASSWORD_REGEX } from "@/constants/core/regexConstants";

/**
 * 아이디를 정규식 검증한다
 * 대,소문자,숫자 6~12자
 * @param {string} str 문자열
 * @returns {boolean} true: 검증성공 false: 검증실패
 */
export const validId = (str: string): boolean => {
  return ID_REGEX.test(str);
};

/**
 * 패스워드를 정규식 검증한다
 * 영문, 숫자, 안전한 특수문자 각각 1개 이상 포함, 8-20자
 * @param {string} str 문자열
 * @returns {boolean} true: 검증성공 false: 검증실패
 */
export const validPassword = (str: string): boolean => {
  return PASSWORD_REGEX.test(str);
};
