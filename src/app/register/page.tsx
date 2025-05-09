'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation'


export default function RegisterPage() {

    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // if (password !== confirmPassword) {
        //     setErrorMsg('비밀번호가 일치하지 않습니다.');
        //     return;
        // }

        const res = await fetch(`/api/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        if (res.ok) {
            setSuccessMsg('회원가입 성공! 로그인 페이지로 이동합니다.');
            // router.push('/dashboard')
            setTimeout(() => router.push('/login'), 1500);
        } else {
            const data = await res.json();
            setErrorMsg(data.error || '회원가입 실패');
        }
    };

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-start px-4 py-8">
        <div className="w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl space-y-6">

          {/* 상단 영역 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button className="text-3xl font-light text-gray-500">&times;</button>
              <h2 className="text-2xl font-bold text-gray-800">회원가입</h2>
              <span className="w-6" />
            </div>
            <hr className="border-black" />
          </div>
    
          {/* 입력 폼 영역 */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* 이메일 */}
              <div className="mb-10">
                <label htmlFor="username" className="block text-sm text-gray-700 mb-1 text-lg mb-4 text-[11pt]">
                  이메일
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="이메일"
                    className="sm:w-1/2 w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E3C56]"
                  />
                  <span className="self-center hidden sm:block">@</span>
                  <select className="sm:w-1/2 w-full px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E3C56]">
                    <option>선택</option>
                    <option>gmail.com</option>
                    <option>naver.com</option>
                    <option>daum.net</option>
                  </select>
                </div>
              </div>
    
              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-sm text-gray-700 mb-4 text-[11pt]">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E3C56] bg-gray-100"
                  placeholder="비밀번호"
                />
              </div>
    
              {/* 비밀번호 확인 */}
              <div className="mb-10">
                <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-4 text-[11pt]">
                  비밀번호 재확인
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E3C56] bg-gray-100"
                  placeholder="비밀번호 확인"
                />
                <p className="text-xs text-gray-500 mt-1">
                  6~20자 / 영문 대문자, 소문자, 숫자, 특수문자 중 2가지 이상 조합
                </p>
              </div>
    
              
              <button className="w-full py-2 bg-[#0E3C56] text-white rounded-md hover:bg-[#0c2f45] transition text-[15pt]">
                가입하기
              </button>
            </div>
          </form>
    
          {errorMsg && <p className="text-red-500 text-center mt-4">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 text-center mt-4">{successMsg}</p>}
        </div>
      </div>
    );
}
