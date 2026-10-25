#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
using namespace std;
int main(int argc,char**argv){
 int n=argc>1?atoi(argv[1]):22, seconds=argc>2?atoi(argv[2]):120;
 uint64_t seed=argc>3?strtoull(argv[3],nullptr,10):42;
 int target=argc>4?atoi(argv[4]):3;
 mt19937_64 rng(seed); vector<int> p(n), bestp; iota(p.begin(),p.end(),0);
 vector<int> starting;
 if(argc>5){ifstream f(argv[5]);int v;while(f>>v)starting.push_back(v);if(starting.size()!=size_t(n))return 2;}
 auto score=[&](const vector<int>& a, bool output=false){
  int cost=0;
  for(int k=0;k<n;k++){
   uint64_t seen=0;int c=0;
   for(int i=0;i<n;i++) if(!(seen>>i&1)){
    c++;int j=i;
    do{seen|=1ull<<j;j=a[j]+k;if(j>=n)j-=n;}while(!(seen>>j&1));
   }
   if(output) cout<<c<<' ';
   int e=max(0,c-target);cost+=e*e;
  }
  return cost;
 };
 auto start=chrono::steady_clock::now();int best=9999;uint64_t it=0;
 for(int restart=0;;restart++){
  if(starting.empty())shuffle(p.begin(),p.end(),rng);
  else{p=starting;for(int j=0;j<restart%5;j++)swap(p[rng()%n],p[rng()%n]);}
  int old=score(p);
  for(int t=0;t<100000;t++,it++){
   if(it%16384==0 && chrono::duration<double>(chrono::steady_clock::now()-start).count()>seconds){cerr<<"done n="<<n<<" iterations="<<it<<" best="<<best<<endl;return 0;}
   int a=rng()%n,b=rng()%n,d=rng()%n;
   if(a==b||a==d||b==d)continue;
   bool triple=(rng()%10<8);
   swap(p[a],p[b]);if(triple)swap(p[b],p[d]);
   int now=score(p);
   double T=0.12+(starting.empty()?1.8:0.55)*pow(1.-double(t)/100000.,2);
   if(now<=old || double(rng())/double(UINT64_MAX)<exp((old-now)/T)) old=now;
   else{if(triple)swap(p[b],p[d]);swap(p[a],p[b]);}
   if(old<best){
    best=old;bestp=p;
    cout<<"n="<<n<<" cost="<<best<<" iterations="<<it<<" p=";for(int x:p)cout<<x<<',';cout<<" cycles=";score(p,true);cout<<endl;
    ofstream f("best_"+to_string(n)+"_"+to_string(seed)+".txt");for(int x:p)f<<x<<' ';f<<endl;
    if(best==0)return 0;
   }
  }
 }
}
